'use client'

import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import { doc, setDoc, onSnapshot } from 'firebase/firestore'
import { db, useAuth } from '@/src/context/authProvider'

export type CartItem = {
  id?: string | number
  productId?: string | number
  title?: string
  price?: number
  image?: string
  quantity: number
  size?: string
  color?: string | { hex?: string; name?: string } | any
  uniqueKey?: string
  isCombo?: boolean
  comboQuantity?: number
  comboOfferPrice?: number
}

type CartContextType = {
  cartItems: CartItem[]
  isCartOpen: boolean
  addToCart: (
    product: Partial<CartItem>,
    quantity?: number,
    size?: string,
    color?: string | any,
    isCombo?: boolean
  ) => void
  removeFromCart: (index: number) => void
  incrementQuantity: (index: number) => void
  decrementQuantity: (index: number) => void
  toggleCart: () => void
  clearCart: () => void
  setIsCartOpen: (open: boolean) => void
  isLoading: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const useCart = (): CartContextType => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}

const CART_STORAGE_KEY = 'coga_cart_items'

export default function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const unsubscribeRef = useRef<(() => void) | null>(null)

  const normalizeColor = (c: any): string => {
    if (!c) return ''
    if (typeof c === 'string') return c
    if (typeof c === 'object' && c.hex) return c.hex
    if (typeof c === 'object' && c.name) return c.name
    return ''
  }

  const generateUniqueKey = (
    productId: any,
    title: string,
    size: string,
    color: any,
    isCombo: boolean = false
  ): string => {
    const normalizedColor = normalizeColor(color)
    const keyString = `${productId || title}-${size}-${normalizedColor}-${isCombo ? 'combo' : 'regular'}`
    let hash = 0
    for (let i = 0; i < keyString.length; i++) {
      const char = keyString.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return `item_${Math.abs(hash).toString(36)}`
  }

  // Load cart immediately from localStorage first (for instant display)
  useEffect(() => {
    const localCart = localStorage.getItem(CART_STORAGE_KEY)
    if (localCart) {
      try {
        const parsed = JSON.parse(localCart)
        setCartItems(Array.isArray(parsed) ? parsed : [])
      } catch (error) {
        console.error('Error parsing local cart:', error)
      }
    }
    setIsLoading(false) // Set loading to false immediately for local cart
  }, [])

  // Load cart from Firestore when user is authenticated
  useEffect(() => {
    if (authLoading) {
      return
    }

    const loadCart = async () => {
      try {
        if (user) {
          // User is logged in - set up real-time listener
          const cartDocRef = doc(db, 'users', user.uid, 'cart', 'items')
          
          const unsubscribe = onSnapshot(
            cartDocRef,
            async (docSnapshot) => {
              if (docSnapshot.exists()) {
                const firestoreCart = docSnapshot.data().items || []
                
                // Check if there's a local cart to merge (only on first load)
                if (!isInitialized) {
                  const localCart = localStorage.getItem(CART_STORAGE_KEY)
                  if (localCart) {
                    try {
                      const parsedLocalCart = JSON.parse(localCart)
                      
                      // Merge local cart with Firestore cart
                      const mergedCart = [...firestoreCart]
                      parsedLocalCart.forEach((localItem: CartItem) => {
                        const existingIndex = mergedCart.findIndex(
                          item => item.uniqueKey === localItem.uniqueKey
                        )
                        if (existingIndex !== -1) {
                          mergedCart[existingIndex].quantity += localItem.quantity
                        } else {
                          mergedCart.push(localItem)
                        }
                      })
                      
                      setCartItems(mergedCart)
                      
                      // Save merged cart to Firestore (with error handling)
                      try {
                        await setDoc(cartDocRef, { 
                          items: mergedCart, 
                          updatedAt: new Date().toISOString() 
                        })
                        localStorage.removeItem(CART_STORAGE_KEY)
                      } catch (firestoreError: any) {
                        console.error('Firestore permission error:', firestoreError)
                        // Keep local storage if Firestore fails
                        if (firestoreError.code === 'permission-denied') {
                          console.warn('Firestore permissions denied - keeping cart in localStorage')
                          localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(mergedCart))
                        }
                      }
                    } catch (error) {
                      console.error('Error merging carts:', error)
                      setCartItems(firestoreCart)
                    }
                  } else {
                    setCartItems(firestoreCart)
                  }
                  setIsInitialized(true)
                } else {
                  // Subsequent updates from Firestore
                  setCartItems(firestoreCart)
                }
              } else {
                // No Firestore cart exists - check localStorage
                if (!isInitialized) {
                  const localCart = localStorage.getItem(CART_STORAGE_KEY)
                  if (localCart) {
                    try {
                      const parsed = JSON.parse(localCart)
                      const items = Array.isArray(parsed) ? parsed : []
                      setCartItems(items)
                      
                      // Save to Firestore with error handling
                      if (items.length > 0) {
                        try {
                          await setDoc(cartDocRef, { 
                            items, 
                            updatedAt: new Date().toISOString() 
                          })
                          localStorage.removeItem(CART_STORAGE_KEY)
                        } catch (firestoreError: any) {
                          console.error('Firestore permission error:', firestoreError)
                          if (firestoreError.code === 'permission-denied') {
                            console.warn('Firestore permissions denied - keeping cart in localStorage')
                            // Keep in localStorage if Firestore fails
                          }
                        }
                      }
                    } catch (error) {
                      console.error('Error parsing local cart:', error)
                      setCartItems([])
                    }
                  } else {
                    setCartItems([])
                  }
                  setIsInitialized(true)
                }
              }
            },
            (error: any) => {
              console.error('Error listening to cart:', error)
              if (error.code === 'permission-denied') {
                console.warn('Firestore permissions denied - using localStorage only')
                // Fall back to localStorage
                const localCart = localStorage.getItem(CART_STORAGE_KEY)
                if (localCart) {
                  try {
                    const parsed = JSON.parse(localCart)
                    setCartItems(Array.isArray(parsed) ? parsed : [])
                  } catch (e) {
                    console.error('Error parsing local cart:', e)
                  }
                }
              }
              setIsInitialized(true)
            }
          )

          unsubscribeRef.current = unsubscribe
        } else {
          // User not logged in - use localStorage
          const savedCart = localStorage.getItem(CART_STORAGE_KEY)
          if (savedCart) {
            try {
              const parsed = JSON.parse(savedCart)
              setCartItems(Array.isArray(parsed) ? parsed : [])
            } catch (error) {
              console.error('Error parsing cart:', error)
              setCartItems([])
            }
          } else {
            setCartItems([])
          }
          setIsInitialized(true)
          
          // Unsubscribe from listener if user logs out
          if (unsubscribeRef.current) {
            unsubscribeRef.current()
            unsubscribeRef.current = null
          }
        }
      } catch (error) {
        console.error('Failed to load cart:', error)
        setIsInitialized(true)
      }
    }

    loadCart()

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
        unsubscribeRef.current = null
      }
    }
  }, [user, authLoading, isInitialized])

  // Save cart to Firestore or localStorage
  const saveCart = async (items: CartItem[]) => {
    if (!isInitialized) return

    try {
      if (user) {
        // Save to Firestore for logged-in users
        const cartDocRef = doc(db, 'users', user.uid, 'cart', 'items')
        try {
          await setDoc(cartDocRef, { 
            items, 
            updatedAt: new Date().toISOString() 
          })
        } catch (firestoreError: any) {
          console.error('Firestore save error:', firestoreError)
          if (firestoreError.code === 'permission-denied') {
            console.warn('Firestore permissions denied - saving to localStorage instead')
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
          }
        }
      } else {
        // Save to localStorage for guests
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
      }
    } catch (error) {
      console.error('Failed to save cart:', error)
      // Fallback to localStorage
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
    }
  }

  const addToCart = (product: Partial<CartItem>, quantity = 1, size?: string, color?: string | any, isCombo: boolean = false) => {
    const updatedItems = (() => {
      const uniqueKey = isCombo
        ? `${product.id || product.title}-${size || ''}-${Date.now()}`
        : generateUniqueKey(
            product.id,
            product.title || '',
            size || '',
            color,
            false
          )

      const existingIndex = cartItems.findIndex(item => item.uniqueKey === uniqueKey)

      if (existingIndex !== -1) {
        const copy = [...cartItems]
        const existing = copy[existingIndex]
        copy[existingIndex] = { 
          ...existing, 
          quantity: (existing.quantity || 0) + quantity 
        }
        return copy
      }

      return [...cartItems, { 
        ...(product as CartItem), 
        quantity, 
        size, 
        color,
        uniqueKey,
        isCombo
      }]
    })()

    setCartItems(updatedItems)
    saveCart(updatedItems)
    setIsCartOpen(true)
  }

  const removeFromCart = (index: number) => {
    const updatedItems = cartItems.filter((_, i) => i !== index)
    setCartItems(updatedItems)
    saveCart(updatedItems)
  }

  const incrementQuantity = (index: number) => {
    const updatedItems = cartItems.map((item, i) =>
      i === index ? { ...item, quantity: item.quantity + 1 } : item
    )
    setCartItems(updatedItems)
    saveCart(updatedItems)
  }

  const decrementQuantity = (index: number) => {
    const updatedItems = cartItems.map((item, i) =>
      i === index && item.quantity > 1
        ? { ...item, quantity: item.quantity - 1 }
        : item
    )
    setCartItems(updatedItems)
    saveCart(updatedItems)
  }

  const toggleCart = () => setIsCartOpen((v) => !v)
  
  const clearCart = async () => {
    setCartItems([])
    localStorage.removeItem(CART_STORAGE_KEY)
    
    if (user) {
      try {
        const cartDocRef = doc(db, 'users', user.uid, 'cart', 'items')
        await setDoc(cartDocRef, { 
          items: [], 
          updatedAt: new Date().toISOString() 
        })
      } catch (error: any) {
        console.error('Failed to clear cart in Firestore:', error)
        if (error.code === 'permission-denied') {
          console.warn('Firestore permissions denied - cart cleared locally only')
        }
      }
    }
  }

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isCartOpen,
        addToCart,
        removeFromCart,
        incrementQuantity,
        decrementQuantity,
        toggleCart,
        clearCart,
        setIsCartOpen,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}