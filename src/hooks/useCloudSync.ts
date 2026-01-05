import { useEffect, useRef, useCallback } from 'react'
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

// Debounce time for syncing (ms)
const SYNC_DEBOUNCE = 2000

export function useCloudSync() {
  const user = useAuthStore(state => state.user)
  const { layers, clearAll: clearLayers } = useCustomPointLayerStore()
  const { vondsten, clearAll: clearVondsten } = useLocalVondstenStore()

  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isInitialLoadRef = useRef(true)
  const lastSyncedLayersRef = useRef<string>('')
  const lastSyncedVondstenRef = useRef<string>('')

  // Sync layers to Firestore
  const syncLayersToCloud = useCallback(async (layersData: CustomPointLayer[]) => {
    if (!user) return

    try {
      const userDocRef = doc(db, 'users', user.uid)
      await setDoc(userDocRef, {
        layers: layersData,
        layersUpdatedAt: serverTimestamp()
      }, { merge: true })

      console.log('☁️ Lagen gesynchroniseerd naar cloud')
    } catch (error) {
      console.error('❌ Fout bij synchroniseren lagen:', error)
    }
  }, [user])

  // Sync vondsten to Firestore
  const syncVondstenToCloud = useCallback(async (vondstenData: LocalVondst[]) => {
    if (!user) return

    try {
      const userDocRef = doc(db, 'users', user.uid)
      await setDoc(userDocRef, {
        vondsten: vondstenData,
        vondstenUpdatedAt: serverTimestamp()
      }, { merge: true })

      console.log('☁️ Vondsten gesynchroniseerd naar cloud')
    } catch (error) {
      console.error('❌ Fout bij synchroniseren vondsten:', error)
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
      } else {
        // No cloud data yet, sync local data to cloud
        console.log('☁️ Geen cloud data gevonden, lokale data wordt gesynchroniseerd...')
        await syncLayersToCloud(layers)
        await syncVondstenToCloud(vondsten)
      }

      isInitialLoadRef.current = false
    } catch (error) {
      console.error('❌ Fout bij laden uit cloud:', error)
      isInitialLoadRef.current = false
    }
  }, [user, layers, vondsten, syncLayersToCloud, syncVondstenToCloud])

  // Load from cloud when user logs in
  useEffect(() => {
    if (user) {
      isInitialLoadRef.current = true
      loadFromCloud()
    } else {
      // Reset refs when user logs out
      isInitialLoadRef.current = true
      lastSyncedLayersRef.current = ''
      lastSyncedVondstenRef.current = ''
    }
  }, [user?.uid]) // Only trigger on user change

  // Sync layers when they change (debounced)
  useEffect(() => {
    if (!user || isInitialLoadRef.current) return

    const layersJson = JSON.stringify(layers)

    // Skip if data hasn't actually changed
    if (layersJson === lastSyncedLayersRef.current) return

    // Clear existing timeout
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current)
    }

    // Debounce sync
    syncTimeoutRef.current = setTimeout(() => {
      lastSyncedLayersRef.current = layersJson
      syncLayersToCloud(layers)
    }, SYNC_DEBOUNCE)

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current)
      }
    }
  }, [user, layers, syncLayersToCloud])

  // Sync vondsten when they change (debounced)
  useEffect(() => {
    if (!user || isInitialLoadRef.current) return

    const vondstenJson = JSON.stringify(vondsten)

    // Skip if data hasn't actually changed
    if (vondstenJson === lastSyncedVondstenRef.current) return

    // Clear existing timeout
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current)
    }

    // Debounce sync
    syncTimeoutRef.current = setTimeout(() => {
      lastSyncedVondstenRef.current = vondstenJson
      syncVondstenToCloud(vondsten)
    }, SYNC_DEBOUNCE)

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current)
      }
    }
  }, [user, vondsten, syncVondstenToCloud])

  return {
    isLoggedIn: !!user,
    syncLayersToCloud,
    syncVondstenToCloud
  }
}
