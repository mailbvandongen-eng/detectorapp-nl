import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  updateDoc
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { Vondst } from '../types/vondst'

interface VondstenState {
  vondsten: Vondst[]
  loading: boolean
  error: string | null

  loadVondsten: (userId: string) => Promise<void>
  addVondst: (vondst: Omit<Vondst, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>
  updateVondst: (id: string, updates: Partial<Vondst>) => Promise<void>
  deleteVondst: (id: string) => Promise<void>
}

export const useVondstenStore = create<VondstenState>()(
  immer((set, get) => ({
    vondsten: [],
    loading: false,
    error: null,

    loadVondsten: async (userId: string) => {
      set(state => { state.loading = true })
      try {
        const q = query(
          collection(db, 'vondsten'),
          where('userId', '==', userId)
        )
        const snapshot = await getDocs(q)
        const vondsten = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Vondst[]

        set(state => {
          state.vondsten = vondsten
          state.loading = false
        })
      } catch (error: any) {
        set(state => {
          state.error = error.message
          state.loading = false
        })
      }
    },

    addVondst: async (vondst) => {
      const now = new Date().toISOString()
      const vondstData = {
        ...vondst,
        createdAt: now,
        updatedAt: now
      }

      const docRef = await addDoc(collection(db, 'vondsten'), vondstData)

      set(state => {
        state.vondsten.push({ ...vondstData, id: docRef.id })
      })

      return docRef.id
    },

    updateVondst: async (id: string, updates: Partial<Vondst>) => {
      const docRef = doc(db, 'vondsten', id)
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      })

      set(state => {
        const index = state.vondsten.findIndex(v => v.id === id)
        if (index !== -1) {
          state.vondsten[index] = { ...state.vondsten[index], ...updates }
        }
      })
    },

    deleteVondst: async (id: string) => {
      await deleteDoc(doc(db, 'vondsten', id))

      set(state => {
        state.vondsten = state.vondsten.filter(v => v.id !== id)
      })
    }
  }))
)
