"use client"
import { uploadToBunnyCDN } from '@/utils/bunnyUpload'
import Image from 'next/image';
import React, { useEffect } from 'react'
import Hls from 'hls.js'
import axios from 'axios';

interface BunnyFile {
    Guid: string;
    StorageZoneName: string;
    Path: string;
    ObjectName: string;
    Length: number;
    LastChanged: string;
    ServerId: number;
    ArrayNumber: number;
    IsDirectory: boolean;
    UserId: string;
    ContentType: string;
    DateCreated: string;
    StorageZoneId: number;
    Checksum: string;
    ReplicatedZones: string;
}

const Profile = () => {
    const [uploadedImages, setUploadedImages] = React.useState<BunnyFile[]>([])
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
            const response = await uploadToBunnyCDN({ file, fileName: file.name, path: 'test' })
            console.log(response)
        }
    }

    useEffect(() => {
        const bunnyFetch = async () => {
            try {
                const response = await axios.get('https://storage.bunnycdn.com/nextauth/test/', {
                    headers: {
                        AccessKey: process.env.NEXT_PUBLIC_BUNNY_STORAGE_API_KEY as string,
                    },
                });

                const data = response.data;
                console.log('File content:', data);
                setUploadedImages(data);
                // console.log(uploadedImages)
            } catch (error) {
                console.error('Error fetching from Bunny CDN:', error);
            }
        };

        bunnyFetch()
    }, [])

    return (
        <div>
            <h1>Profile</h1>

            <div>
                <input type="file" ref={fileRef} onChange={handleFileChange} name="" id="" />
                <div>
                    <button className="px-2 py-1 bg-blue-400 mt-2" onClick={handleUpload}>upload to bunny</button>
                </div>
            </div>
            {uploadedImages.map((file) => {
                const imgUrl = process.env.NEXT_PUBLIC_BUNNY_CDN + '/test/' + file.ObjectName
                return (
                    <div key={file.Guid} >
                        <Image src={imgUrl} width={300} height={300} alt="" />
                    </div>
                )
            })}

            {/* <video
                    id="video"
                    controls
                    ref={(video) => {
                        if (video && Hls.isSupported()) {
                            const hls = new Hls();
                            hls.loadSource("https://vz-2a3fd94c-879.b-cdn.net/a1949de3-71c4-4f23-a99b-29fcfc0750a2/playlist.m3u8");
                            hls.attachMedia(video);
                        }
                    }}
                ></video> */}

            <div className='w-full relative pt-[56.25%]'>
                <iframe
                    src="https://iframe.mediadelivery.net/play/430832/a1949de3-71c4-4f23-a99b-29fcfc0750a2"
                    className="absolute top-0 left-0 w-full h-full"
                    frameBorder="0"
                    allowFullScreen={true}
                    allow="autoplay; encrypted-media; picture-in-picture"
                    title="Video Player"
                >
                </iframe>
            </div>
        </div>
    )
}

export default Profile