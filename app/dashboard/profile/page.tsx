"use client"
import { uploadToBunnyCDN } from '@/utils/bunnyUpload'
import React from 'react'

const Profile = () => {
    const fileRef = React.useRef<HTMLInputElement>(null)

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            console.log('Selected file:', file)
        }
    }

    const handleUpload = async () => {
        const file = fileRef?.current?.files?.[0]
        if (file) {
            const response = await uploadToBunnyCDN({ file, fileName: file.name })
            console.log(response)
        }
    }

    return (
        <div>
            <h1>Profile</h1>

            <div>
                <input type="file" ref={fileRef} onChange={handleFileChange} name="" id="" />
                <div>
                    <button className="px-2 py-1 bg-blue-400 mt-2" onClick={handleUpload}>upload to bunny</button>

                </div>
            </div>
        </div>
    )
}

export default Profile