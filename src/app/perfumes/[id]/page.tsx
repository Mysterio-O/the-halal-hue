import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProductById } from '@/lib/queries/products';
import ProductDetailClient from './ProductDetailClient';

interface Props {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const product = await getProductById(id);
    if (!product) {
        return {
            title: 'Perfume Not Found',
            description: 'The requested perfume could not be found.',
            robots: {
                index: false,
                follow: false,
            },
        };
    }

    const productUrl = `/perfumes/${id}`;
    const description =
        product.pr_description?.trim() ||
        `Shop ${product.pr_name} from The Halal Hue - authentic halal fragrance with premium notes.`;

    const imageUrl = product.primaryPhoto?.photo_url || '/assets/logo.webp';

    return {
        title: product.pr_name,
        description,
        keywords: [
            product.pr_name,
            'halal perfume',
            'attar',
            'luxury fragrance',
            product.categories?.cat_name || 'perfume',
        ],
        alternates: {
            canonical: productUrl,
        },
        openGraph: {
            type: 'website',
            url: productUrl,
            title: `${product.pr_name} | The Halal Hue`,
            description,
            images: [
                {
                    url: imageUrl,
                    width: 1200,
                    height: 630,
                    alt: product.pr_name,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: `${product.pr_name} | The Halal Hue`,
            description,
            images: [imageUrl],
        },
    };
}

export default async function PerfumeDetailPage({ params }: Props) {
    const { id } = await params;
    const product = await getProductById(id);

    if (!product) notFound();

    return <ProductDetailClient product={product} />;
}