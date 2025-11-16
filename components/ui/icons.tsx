'use client'

import Image from 'next/image'

function IconLogo({
  className,
  src = '/images/Logo.svg',
  alt = 'Logo'
}: {
  className?: string
  src?: string
  alt?: string
}) {
  return (
    <Image
      src={src}
      alt={alt}
      width={48}
      height={48}
      className={className}
      priority
    />
  )
}

export { IconLogo }
