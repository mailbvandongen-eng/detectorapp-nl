import { useEffect, useRef, useCallback, useState } from 'react'
import {
  collection,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuthStore } from '../store/authStore'
import { useCustomPointLayerStore, type CustomPointLayer } from '../store/customPointLayerStore'
import { useLocalVondstenStore, type LocalVondst } from '../store/localVondstenStore'
import { useRouteRecordingStore, type RecordedRoute } from '../store/routeRecordingStore'

// Debounce time for syncing (ms)
const SYNC_DEBOUNCE = 2000

// Sync status type
export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error'

// Wait for all stores to hydrate from localStorage
async function waitForHydration(): Promise<void> {
  const stores = [
    useCustomPointLayerStore,
    useLocalVondstenStore,
    useRouteRecordingStore
  ]

  await Promise.all(stores.map(store => {
    // If already hydrated, resolve immediately
    if (store.persist.hasHydrated()) {
      return Promise.resolve()
    }
    // Otherwise wait for hydration
    return new Promise<void>(resolve => {
      const unsubscribe = store.persist.onFinishHydration(() => {
        unsubscribe()
        resolve()
      })
    })
  }))
}

export function useCloudSync() {
  const user = useAuthStore(state => state.user)
  const { layers, clearAll: clearLayers } = useCustomPointLayerStore()
  const { vondsten, clearAll: clearVondsten } = useLocalVondstenStore()
  const { savedRoutes } = useRouteRecordingStore()

  // Separate timeout refs for each data type to prevent overwrites
  const layersSyncTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const vondstenSyncTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const routesSyncTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isInitialLoadRef = useRef(true)
  const lastSyncedLayersRef = useRef<string>('')
  const lastSyncedVondstenRef = useRef<string>('')
  const lastSyncedRoutesRef = useRef<string>('')
  const [isHydrated, setIsHydrated] = useState(false)
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle')
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)
  const unsubscribeRef = useRef<(() => void) | null>(null)

  // Wait for hydration on mount
  useEffect(() => {
    waitForHydration().then(() => {
      setIsHydrated(true)
      console.log('💧 Stores gehydrateerd uit localStorage')
    })
  }, [])

  // Sync layers to Firestore
  const syncLayersToCloud = useCallback(async (layersData: CustomPointLayer[]) => {
    if (!user) return

    setSyncStatus('syncing')
    try {
      const userDocRef = doc(db, 'users', user.uid)
      await setDoc(userDocRef, {
        layers: layersData,
        layersUpdatedAt: serverTimestamp()
      }, { merge: true })

      console.log('☁️ Lagen gesynchroniseerd naar cloud')
      setSyncStatus('synced')
      setLastSyncTime(new Date())
    } catch (error) {
      console.error('❌ Fout bij synchroniseren lagen:', error)
      setSyncStatus('error')
    }
  }, [user])

  // Sync vondsten to Firestore
  const syncVondstenToCloud = useCallback(async (vondstenData: LocalVondst[]) => {
    if (!user) return

    setSyncStatus('syncing')
    try {
      const userDocRef = doc(db, 'users', user.uid)
      await setDoc(userDocRef, {
        vondsten: vondstenData,
        vondstenUpdatedAt: serverTimestamp()
      }, { merge: true })

      console.log('☁️ Vondsten gesynchroniseerd naar cloud')
      setSyncStatus('synced')
      setLastSyncTime(new Date())
    } catch (error) {
      console.error('❌ Fout bij synchroniseren vondsten:', error)
      setSyncStatus('error')
    }
  }, [user])

  // Sync routes to Firestore
  const syncRoutesToCloud = useCallback(async (routesData: RecordedRoute[]) => {
    if (!user) return

    setSyncStatus('syncing')
    try {
      const userDocRef = doc(db, 'users', user.uid)
      await setDoc(userDocRef, {
        routes: routesData,
        routesUpdatedAt: serverTimestamp()
      }, { merge: true })

      console.log('☁️ Routes gesynchroniseerd naar cloud')
      setSyncStatus('synced')
      setLastSyncTime(new Date())
    } catch (error) {
      console.error('❌ Fout bij synchroniseren routes:', error)
      setSyncStatus('error')
    }
  }, [user])

  // Load data from cloud on login
  const loadFromCloud = useCallback(async () => {
    if (!user) return

    try {
      const userDocRef = doc(db, 'users', user.uid)
      const docSnap = await getDoc(userDocRef)

      if (docSnap.exists()) {
        const data = docSnap.data()

        // Load layers from cloud
        if (data.layers && Array.isArray(data.layers)) {
          const cloudLayers = data.layers as CustomPointLayer[]
          const localLayers = useCustomPointLayerStore.getState().layers

          // Merge: keep local layers that aren't in cloud, add cloud layers
          const mergedLayers = [...cloudLayers]

          // Add local layers that don't exist in cloud (by id)
          const cloudLayerIds = new Set(cloudLayers.map(l => l.id))
          localLayers.forEach(localLayer => {
            if (!cloudLayerIds.has(localLayer.id)) {
              mergedLayers.push(localLayer)
            }
          })

          // Update store with merged data
          useCustomPointLayerStore.setState({ layers: mergedLayers })
          lastSyncedLayersRef.current = JSON.stringify(mergedLayers)

          console.log(`☁️ ${cloudLayers.length} lagen geladen uit cloud`)
        }

        // Load vondsten from cloud
        if (data.vondsten && Array.isArray(data.vondsten)) {
          const cloudVondsten = data.vondsten as LocalVondst[]
          const localVondsten = useLocalVondstenStore.getState().vondsten

          // Merge: keep local vondsten that aren't in cloud
          const mergedVondsten = [...cloudVondsten]

          const cloudVondstIds = new Set(cloudVondsten.map(v => v.id))
          localVondsten.forEach(localVondst => {
            if (!cloudVondstIds.has(localVondst.id)) {
              mergedVondsten.push(localVondst)
            }
          })

          useLocalVondstenStore.setState({ vondsten: mergedVondsten })
          lastSyncedVondstenRef.current = JSON.stringify(mergedVondsten)

          console.log(`☁️ ${cloudVondsten.length} vondsten geladen uit cloud`)
        }

        // Load routes from cloud
        if (data.routes && Array.isArray(data.routes)) {
          const cloudRoutes = data.routes as RecordedRoute[]
          const localRoutes = useRouteRecordingStore.getState().savedRoutes

          // Merge: keep local routes that aren't in cloud
          const mergedRoutes = [...cloudRoutes]

          const cloudRouteIds = new Set(cloudRoutes.map(r => r.id))
          localRoutes.forEach(localRoute => {
            if (!cloudRouteIds.has(localRoute.id)) {
              mergedRoutes.push(localRoute)
            }
          })

          // Make all routes visible by default
          const allRouteIds = new Set(mergedRoutes.map(r => r.id))

          useRouteRecordingStore.setState({
            savedRoutes: mergedRoutes,
            visibleRouteIds: allRouteIds
          })
          lastSyncedRoutesRef.current = JSON.stringify(mergedRoutes)

          console.log(`☁️ ${cloudRoutes.length} routes geladen uit cloud`)
        }
      } else {
        // No cloud data yet, sync local data to cloud
        console.log('☁️ Geen cloud data gevonden, lokale data wordt gesynchroniseerd...')
        await syncLayersToCloud(layers)
        await syncVondstenToCloud(vondsten)
        await syncRoutesToCloud(savedRoutes)
      }

      isInitialLoadRef.current = false
    } catch (error) {
      console.error('❌ Fout bij laden uit cloud:', error)
      isInitialLoadRef.current = false
    }
  }, [user, layers, vondsten, savedRoutes, syncLayersToCloud, syncVondstenToCloud, syncRoutesToCloud])

  // Load from cloud when user logs in (after hydration)
  useEffect(() => {
    if (!isHydrated) return // Wait for localStorage hydration first

    if (user) {
      isInitialLoadRef.current = true
      loadFromCloud()
    } else {
      // Reset refs when user logs out
      isInitialLoadRef.current = true
      lastSyncedLayersRef.current = ''
      lastSyncedVondstenRef.current = ''
      lastSyncedRoutesRef.current = ''
    }
  }, [user?.uid, isHydrated]) // Trigger on user change AND when hydration completes

  // Sync layers when they change (debounced)
  useEffect(() => {
    if (!user || !isHydrated || isInitialLoadRef.current) return

    const layersJson = JSON.stringify(layers)

    // Skip if data hasn't actually changed
    if (layersJson === lastSyncedLayersRef.current) return

    // Clear existing timeout
    if (layersSyncTimeoutRef.current) {
      clearTimeout(layersSyncTimeoutRef.current)
    }

    // Debounce sync
    layersSyncTimeoutRef.current = setTimeout(() => {
      lastSyncedLayersRef.current = layersJson
      syncLayersToCloud(layers)
    }, SYNC_DEBOUNCE)

    return () => {
      if (layersSyncTimeoutRef.current) {
        clearTimeout(layersSyncTimeoutRef.current)
      }
    }
  }, [user, layers, syncLayersToCloud, isHydrated])

  // Sync vondsten when they change (debounced)
  useEffect(() => {
    if (!user || !isHydrated || isInitialLoadRef.current) return

    const vondstenJson = JSON.stringify(vondsten)

    // Skip if data hasn't actually changed
    if (vondstenJson === lastSyncedVondstenRef.current) return

    // Clear existing timeout
    if (vondstenSyncTimeoutRef.current) {
      clearTimeout(vondstenSyncTimeoutRef.current)
    }

    // Debounce sync
    vondstenSyncTimeoutRef.current = setTimeout(() => {
      lastSyncedVondstenRef.current = vondstenJson
      syncVondstenToCloud(vondsten)
    }, SYNC_DEBOUNCE)

    return () => {
      if (vondstenSyncTimeoutRef.current) {
        clearTimeout(vondstenSyncTimeoutRef.current)
      }
    }
  }, [user, vondsten, syncVondstenToCloud, isHydrated])

  // Sync routes when they change (debounced)
  useEffect(() => {
    if (!user || !isHydrated || isInitialLoadRef.current) return

    const routesJson = JSON.stringify(savedRoutes)

    // Skip if data hasn't actually changed
    if (routesJson === lastSyncedRoutesRef.current) return

    // Clear existing timeout
    if (routesSyncTimeoutRef.current) {
      clearTimeout(routesSyncTimeoutRef.current)
    }

    // Debounce sync
    routesSyncTimeoutRef.current = setTimeout(() => {
      lastSyncedRoutesRef.current = routesJson
      syncRoutesToCloud(savedRoutes)
    }, SYNC_DEBOUNCE)

    return () => {
      if (routesSyncTimeoutRef.current) {
        clearTimeout(routesSyncTimeoutRef.current)
      }
    }
  }, [user, savedRoutes, syncRoutesToCloud, isHydrated])

  // Force sync all data immediately (bypasses debounce)
  const forceSync = useCallback(async () => {
    if (!user) return

    console.log('🔄 Forceer synchronisatie gestart...')
    setSyncStatus('syncing')

    try {
      // Get current state
      const currentLayers = useCustomPointLayerStore.getState().layers
      const currentVondsten = useLocalVondstenStore.getState().vondsten
      const currentRoutes = useRouteRecordingStore.getState().savedRoutes

      // Sync all data
      await Promise.all([
        syncLayersToCloud(currentLayers),
        syncVondstenToCloud(currentVondsten),
        syncRoutesToCloud(currentRoutes)
      ])

      // Update refs
      lastSyncedLayersRef.current = JSON.stringify(currentLayers)
      lastSyncedVondstenRef.current = JSON.stringify(currentVondsten)
      lastSyncedRoutesRef.current = JSON.stringify(currentRoutes)

      console.log('✅ Forceer synchronisatie voltooid')
      setSyncStatus('synced')
      setLastSyncTime(new Date())
    } catch (error) {
      console.error('❌ Forceer synchronisatie mislukt:', error)
      setSyncStatus('error')
    }
  }, [user, syncLayersToCloud, syncVondstenToCloud, syncRoutesToCloud])

  // Reload data from cloud (useful after login on new device)
  const reloadFromCloud = useCallback(async () => {
    if (!user) return

    console.log('🔄 Herladen van cloud gestart...')
    setSyncStatus('syncing')
    isInitialLoadRef.current = true
    await loadFromCloud()
    setSyncStatus('synced')
    setLastSyncTime(new Date())
  }, [user, loadFromCloud])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
      }
    }
  }, [])

  return {
    isLoggedIn: !!user,
    syncStatus,
    lastSyncTime,
    syncLayersToCloud,
    syncVondstenToCloud,
    syncRoutesToCloud,
    forceSync,
    reloadFromCloud
  }
}
