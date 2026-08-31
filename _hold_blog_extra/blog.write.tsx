import { useState, useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import { supabase } from '@/integrations/supabase/client'

export const Route = createFileRoute('/blog/write')({
  component: WritePostPage,
})

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
}

async function generateUniqueSlug(title: string): Promise<string> {
  const base = slugify(title)
  let candidate = base
  let counter = 2

  while (true) {
    const { data } = await supabase
      .from('blog_posts')
      .select('id')
      .eq('slug', candidate)
      .maybeSingle()

    if (!data) return candidate // slug free hai, use kar lo

    candidate = `${base}-${counter}` // clash hua, "-2", "-3" try karo
    counter++
  }
}

function WritePostPage() {
  const [user, setUser] = useState<any>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [title, setTitle] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [metaDescription, setMetaDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const editor = useEditor({
    extensions: [StarterKit, Link],
    content: '<p>Start writing your post here...</p>',
  })

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setCheckingAuth(false)
    })
    supabase.from('categories').select('id, name').then(({ data }) => {
      setCategories(data ?? [])
    })
  }, [])

  async function handleSubmit() {
    if (!user || !editor) return
    if (!title.trim() || !categoryId) {
      alert('Title aur category zaroori hai')
      return
    }
    setSubmitting(true)

    const slug = await generateUniqueSlug(title)
    const { error } = await supabase.from('blog_posts').insert({
      title,
      slug,
      meta_description: metaDescription,
      content: editor.getHTML(),
      category_id: categoryId,
      author_id: user.id,
    })

    setSubmitting(false)
    if (error) {
      alert('Error: ' + error.message)
      return
    }
    setSubmitted(true)
  }

  if (checkingAuth) return <p className="p-8">Loading...</p>
  if (!user)
    return (
      <div className="max-w-xl mx-auto p-8 text-center">
        <p>Post likhne ke liye pehle login karo.</p>
      </div>
    )
  if (submitted)
    return (
      <div className="max-w-xl mx-auto p-8 text-center">
        <h2 className="text-xl font-semibold">Submit ho gaya! 🎉</h2>
        <p className="text-gray-600 mt-2">
          Tumhara post review ke liye bhej diya gaya hai. Admin approve karega uske baad hi live hoga.
        </p>
      </div>
    )

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Write a Blog Post</h1>

      <input
        type="text"
        placeholder="Post title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full border rounded px-3 py-2 mb-4 text-lg"
      />

      <select
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
        className="w-full border rounded px-3 py-2 mb-4"
      >
        <option value="">Select a category</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <textarea
        placeholder="Short meta description (for SEO)"
        value={metaDescription}
        onChange={(e) => setMetaDescription(e.target.value)}
        className="w-full border rounded px-3 py-2 mb-4"
        rows={2}
      />

      <div className="flex gap-2 mb-2 border rounded p-2">
        <button onClick={() => editor?.chain().focus().toggleBold().run()} className="px-2 py-1 border rounded font-bold">B</button>
        <button onClick={() => editor?.chain().focus().toggleItalic().run()} className="px-2 py-1 border rounded italic">I</button>
        <button onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} className="px-2 py-1 border rounded">H2</button>
        <button onClick={() => editor?.chain().focus().toggleBulletList().run()} className="px-2 py-1 border rounded">• List</button>
        <button
          onClick={() => {
            const url = window.prompt('Link URL:')
            if (url) editor?.chain().focus().setLink({ href: url }).run()
          }}
          className="px-2 py-1 border rounded"
        >
          Link
        </button>
      </div>

      <div className="border rounded px-3 py-2 min-h-[300px] prose max-w-none">
        <EditorContent editor={editor} />
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="mt-6 bg-blue-600 text-white px-6 py-2 rounded disabled:opacity-50"
      >
        {submitting ? 'Submitting...' : 'Submit for Review'}
      </button>
    </div>
  )
}