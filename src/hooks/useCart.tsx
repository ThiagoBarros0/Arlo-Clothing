import {createContext, ReactNode, useContext, useState} from 'react'
import { toast } from 'react-toastify'
import { api } from '../services/api'

interface CartProviderProps {
    children: ReactNode
}

interface Product {
    id: number
    title: string
    price: number
    image: string
    amount:number
}

interface CartContextData {
    cart: Product[]
    addProduct: (productId: number) => Promise<void>
}

const CartContext = createContext<CartContextData>({} as CartContextData)

export const CartProvider = ({children}: CartProviderProps) => {
    const[cart, setCart] = useState<Product[]>(() => {
        const storagedCart = localStorage.getItem 
        ('@ArloClothing:cart')

        if(storagedCart){
            return JSON.parse(storagedCart)
        }
        return[]
    })

    const addProduct = async (productId: number) => {
        try{
            const updatedCart = [...cart]

            const productExists = updatedCart.find(product => product.id === productId)

            const stock = await api.get(`stock/${productId}`)

            const stockAmount = stock.data.amount

            const currentAmount = productExists ? productExists.amount : 0

            const amount = currentAmount + 1

            if (amount > stockAmount){
                toast.error('Quantidade solicitade fora de estoque')
                return
            }

            if(productExists){
                productExists.amount = amount
            }else{
                const product = await api.get(`products/${productId}`)
                product.data.amount = 1
                updatedCart.push(product.data)
            }

            setCart(updatedCart)
            localStorage.setItem('@ArloClothing:cart', JSON.stringify
            (updatedCart))
            
            toast.success('Produto adicionado com sucesso')

        } catch{
            toast.error('Erro na adição do produto')
        }
    }
    
    return (
        <CartContext.Provider value={{cart , addProduct}}>
            {children}
        </CartContext.Provider>
    )
}

export function useCart(): CartContextData{
    const context = useContext(CartContext)
    return context
}