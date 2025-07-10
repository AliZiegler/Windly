'use client'

import { useEffect } from 'react'
import { signIn } from 'next-auth/react'

export default function AutoSignIn() {
    useEffect(() => {
        signIn('google')
    }, [])
    return null
}
