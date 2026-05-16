User: -- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.categories (
id uuid NOT NULL DEFAULT gen_random_uuid(),
cat_name character varying NOT NULL,
cat_description text,
cat_status USER-DEFINED DEFAULT 'ACTIVE'::category_status,
created_at timestamp with time zone DEFAULT now(),
updated_at timestamp with time zone DEFAULT now(),
CONSTRAINT categories_pkey PRIMARY KEY (id)
);
CREATE TABLE public.offers (
id uuid NOT NULL DEFAULT gen_random_uuid(),
off_name character varying NOT NULL,
description text,
off_ends timestamp with time zone,
off_discount_percentage integer,
off_status USER-DEFINED DEFAULT 'ACTIVE'::offer_status,
created_at timestamp with time zone DEFAULT now(),
updated_at timestamp with time zone DEFAULT now(),
CONSTRAINT offers_pkey PRIMARY KEY (id)
);
CREATE TABLE public.price_lists (
id uuid NOT NULL DEFAULT gen_random_uuid(),
product_id uuid NOT NULL,
price numeric NOT NULL,
quantity integer NOT NULL CHECK (quantity > 0),
created_at timestamp with time zone DEFAULT now(),
updated_at timestamp with time zone DEFAULT now(),
CONSTRAINT price_lists_pkey PRIMARY KEY (id),
CONSTRAINT price_lists_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);
CREATE TABLE public.product_photos (
id uuid NOT NULL DEFAULT gen_random_uuid(),
product_id uuid NOT NULL,
photo_url text NOT NULL,
storage_path text NOT NULL,
is_primary boolean DEFAULT false,
created_at timestamp with time zone DEFAULT now(),
updated_at timestamp with time zone DEFAULT now(),
CONSTRAINT product_photos_pkey PRIMARY KEY (id),
CONSTRAINT product_photos_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);
CREATE TABLE public.products (
id uuid NOT NULL DEFAULT gen_random_uuid(),
cat_id uuid NOT NULL,
off_id uuid,
pr_name character varying NOT NULL,
pr_description text,
pr_status USER-DEFINED DEFAULT 'ACTIVE'::product_status,
pr_sku character varying NOT NULL UNIQUE,
created_at timestamp with time zone DEFAULT now(),
updated_at timestamp with time zone DEFAULT now(),
CONSTRAINT products_pkey PRIMARY KEY (id),
CONSTRAINT products_cat_id_fkey FOREIGN KEY (cat_id) REFERENCES public.categories(id),
CONSTRAINT products_off_id_fkey FOREIGN KEY (off_id) REFERENCES public.offers(id)
);
CREATE TABLE public.user_profiles (
id uuid NOT NULL DEFAULT gen_random_uuid(),
user_id uuid NOT NULL UNIQUE,
full_name character varying NOT NULL,
email character varying NOT NULL,
user_role USER-DEFINED DEFAULT 'MANAGER'::user_roles,
user_status USER-DEFINED DEFAULT 'ACTIVE'::user_status,
avatar_url text,
created_at timestamp with time zone DEFAULT now(),
updated_at timestamp with time zone DEFAULT now(),
CONSTRAINT user_profiles_pkey PRIMARY KEY (id),
CONSTRAINT user_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

this is the db schema.

currently i am letting admin create offer from /admin/add-product page.

but the offer modal doesnt incliude the expiry data and many more. include them. and create another page /admin/offers to handle those offers (create new, update existing, toggle status, delete)

and in the landing page, in the offer section, its only showing offer percentage. i wanna show the products that includes in that offer as well there. the products cards will contain small image, name price and view details button

read frontend design and vercel react best practices skills to accomplish these jobs.

if you are ever confused, you can ask me those things


another thing you will have to do is:

implement proper SEO on layout.tsx, /perfumes/id, and /products page.

here is an example:
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
  title: {
    default: "Southern Traditions - Texas Roofing & Construction",
    template: "%s | Southern Traditions",
  },
  description: "Trusted Texas roofing and construction experts.",
  keywords:
    "Texas roofing, roof replacement, storm damage, hail damage, roofing contractor, Dallas roofing, Houston roofing, insurance claims",
  authors: [{ name: "Southern Traditions Roofing & Construction LLC" }],
  icons: {
    icon: "/assets/fevicon.ico",
    shortcut: "/assets/fevicon.ico",
    // apple: "/assets/logo.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Saltedhash Tech",
  },
  // openGraph: {
  //   type: "website",
  //   locale: "en_US",
  //   url: "/",
  //   siteName: "Southern Traditions",
  //   title: "Southern Traditions - Texas Roofing & Construction",
  //   description: "Trusted Texas roofing and construction experts.",
  //   images: [
  //     {
  //       url: "/assets/logo.png",
  //       width: 1200,
  //       height: 630,
  //       alt: "Southern Traditions - Trusted Texas Roofing Experts",
  //     },
  //   ],
  // },
  // twitter: {
  //   card: "summary_large_image",
  //   title: "Southern Traditions - Texas Roofing & Construction",
  //   description: "Trusted Texas roofing and construction experts.",
  //   images: ["/og?title=Trusted%20Texas%20Roofing%20Experts"],
  // },

  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_SITE_URL,
    siteName: "Southern Traditions - Texas Roofing & Construction",
    title: "Southern Traditions - Texas Roofing & Construction",
    description:
      "Trusted Texas roofing and construction experts. Texas-trusted experts in roofing and construction. Reliable Texas roofing & construction professionals. Trusted experts for Texas roofing and construction",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/assets/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Southern Traditions - Texas Roofing & Construction",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Southern Traditions - Texas Roofing & Construction",
    description:
      "Trusted Texas roofing and construction experts. Texas-trusted experts in roofing and construction. Reliable Texas roofing & construction professionals. Trusted experts for Texas roofing and construction",
    images: [`${process.env.NEXT_PUBLIC_SITE_URL}/assets/og-image.png`],
    creator: "@southerntraditions",
  },
};


implement SEO like this. i have public/assets/logo.webp and favicon.web

use the logo to show in opengraph and other places so that the live link shows the preview with title, description and image properly on multiple platform and multiple devices.

if you need more information to do this more efficiently, you can ask me for them directly.
