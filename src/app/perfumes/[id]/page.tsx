import React from 'react';
import { notFound } from 'next/navigation';
import { getProductById } from '@/lib/queries/products';
import ProductDetailClient from './ProductDetailClient';

interface Props {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
    const { id } = await params;
    const product = await getProductById(id);
    if (!product) return { title: 'Not Found' };
    return {
        title: `${product.pr_name} | The Halal Hue`,
        description: product.pr_description ?? `Shop ${product.pr_name} — authentic halal fragrance.`,
    };
}

export default async function PerfumeDetailPage({ params }: Props) {
    const { id } = await params;
    const product = await getProductById(id);

    if (!product) notFound();

    return <ProductDetailClient product={product} />;
}