import {createContext, ReactNode, useContext, useState} from 'react'
import { toast } from 'react-toastify'
import { api } from '../services/api'

interface CartProviderProps {
    children: ReactNode
}

interface UpdateProductAmount{
    productId: number
    amount: number
}

interface Stock{
    id: number
    amount: number
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
    UpdateProductAmount : ({productId, amount}: UpdateProductAmount) => void
    removeProduct: (productId:number) => void
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
    
    const UpdateProductAmount = async ({ productId, amount}:UpdateProductAmount) => {
        try{
            if(amount <= 0 ){
                return
            }

            const stock = await api.get<Stock>(`stock/${productId}`)
            const stockAmount = stock.data.amount

            if(amount > stockAmount){
                toast.error('Quantidade solicitade fora de estoque')
                return
            }

            const updatedCart = [...cart]
            const productExists = updatedCart.find(
                product => product.id === productId
            )
            if(productExists){
                productExists.amount = amount
                setCart(updatedCart)
                localStorage.setItem('@ArloClothing:cart',JSON.stringify
                (updatedCart))
            }else{
                throw Error()
            }


        } catch {
            toast.error('Erro na alteração da quantidade de produto')
        }
    }

    const removeProduct = (productId: number) => {
        try{
            const updatedCart = [...cart]
            const productIndex = updatedCart.findIndex(
                product => product.id === productId
            )

            if(productId >= 0){
                updatedCart.splice(productIndex, 1)

                setCart(updatedCart)
                localStorage.setItem('@ArloClothing:cart',JSON.stringify
                (updatedCart))
            }else{
                throw Error()
            }
        } catch{
            toast.error('Erro na remoção de produto')
        }
    }

    return (
        <CartContext.Provider value={{cart , addProduct, UpdateProductAmount, removeProduct}}>
            {children}
        </CartContext.Provider>
    )
}

export function useCart(): CartContextData{
    const context = useContext(CartContext)
    return context
}