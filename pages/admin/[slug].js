import AuthCheck from "../../components/AuthCheck"
import { firestore, auth, serverTimeStamp } from '../../lib/firebase'
import ImageUploader from "../../components/ImageUploader"

import { useState } from "react"
import { useRouter } from "next/router"

import { useDocumentDataOnce } from "react-firebase-hooks/firestore"
import { useForm } from "react-hook-form"
import ReactMarkdown from "react-markdown"
import Link from "next/link"
import toast from "react-hot-toast"


export default function AdminPostsEdit(props) {
    return (
        <AuthCheck>
            <PostManager />
        </AuthCheck>
    )
}

function PostManager() {
    const [preview, setPreview] = useState(false)
    const router = useRouter()
    const { slug } = router.query
    const postRef = firestore.collection('users').doc(auth.currentUser.uid).collection('posts').doc(slug)
    const [post] = useDocumentDataOnce(postRef)

    return (
        <main>
            {post && (
                <>
                    <section>
                        <h1>{post.title}</h1>
                        <p>ID: {post.slug}</p>
                        <PostForm postRef={postRef} defaultValues={post} preview={preview} />
                    </section>

                    <aside>
                        <h3>Tools</h3>
                        <button onClick={() => setPreview(!preview)}>{preview ? 'Edit' : 'Preview'}</button>
                        <Link href={`/${post.username}/${post.slug}`}>
                            <button className="btn-blue">Live View</button>
                        </Link>
                    </aside>
                </>
            )}
        </main>

    )

    function PostForm({ defaultValues, postRef, preview }) {
        const { register, handleSubmit, reset, watch, formState: { errors, isValid, isDirty } } = useForm({ defaultValues, mode: 'onChange' })



        const updatePost = async ({ content, published }) => {
            console.log(content, published)

            await postRef.update({
                content,
                published,
                updatedAt: serverTimeStamp(),
            })

            reset({ content, published })
            toast.success('Post updated successfully!')
        }
        return (
            <form onSubmit={handleSubmit(updatePost)}>
                {preview && (
                    <div className="card">
                        <ReactMarkdown>{watch('content')}</ReactMarkdown>
                    </div>
                )}

                <div>

                    <ImageUploader />

                    <textarea {...register('content', {
                        maxLength: { value: 20000, message: "This post is too long" },
                        minLength: { value: 10, message: "This post is too short" },
                        required: { value: true, message: "Content is required" },
                    })} name='content' />

                    {errors.content && <p className="text-danger">{errors.content.message}</p>}

                    <fieldset className="push-left">
                        <input type='checkbox' name='published' {...register('published')} />
                        <label>Published</label>
                    </fieldset>
                    <button type='submit' className="btn-green" disabled={!isDirty || !isValid}>
                        Save Changes
                    </button>
                </div>
            </form>
        )
    }
}