import AddProducts from '@/components/add-product'
import React, { Suspense } from 'react'

export default function AddProductPage() {
    return (
       <Suspense fallback={<div>Loading...</div>}>
         <AddProducts />
       </Suspense>
    )
}
