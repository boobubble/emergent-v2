import { useState, useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { supabase } from '@/integrations/supabase/client'

export const Route = createFileRoute('/admin/blog/moderate')({
  component: ModeratePage,
})

function ModeratePage() {
  const [checking, setChecking] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAdminAndLoad()
  }, [])

  async function checkAdminAndLoad() {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) {
      setChecking(false)
      return
    }

    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userData.user.id)
      .in('role', ['admin', 'super_admin'])

    const admin = (roleData?.length ?? 0) > 0
    setIsAdmin(admin)
    setChecking(false)

    if (admin) loadPendingPosts()
  }

  async function loadPendingPosts() {
    setLoading(true)
    const { data } = await supabase
      .from('blog_posts')
      .select('id, title, content, meta_description, published_at, status, category_id, author_id, categories(name)')
      .eq('status', 'pending')
      .order('published_at', { ascending: false })
    setPosts(data ?? [])
    setLoading(false)
  }

  async function updateStatus(id: string, status: 'published' | 'rejected') {
    const { error } = await supabase.from('blog_posts').update({ status }).eq('id', id)
    if (error) {
      alert('Error: ' + error.message)
      return
    }
    setPosts((prev) => prev.filter((p) => p.id !== id))
  }

  if (checking) return <p className="p-8">Loading...</p>
  if (!isAdmin) return <p className="p-8">Access denied. Admin/moderator hi ye page dekh sakte hain.</p>

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Pending Blog Posts</h1>

      {loading && <p>Loading posts...</p>}
      {!loading && posts.length === 0 && <p className="text-gray-500">Koi pending post nahi hai. 🎉</p>}

      <div className="space-y-6">
        {posts.map((post) => (
          <div key={post.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-lg font-semibold">{post.title}</h2>
              <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                {post.categories?.name ?? 'Uncategorized'}
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-2">{post.meta_description}</p>
            <div
              className="prose max-w-none border-t pt-3 mt-3 max-h-64 overflow-y-auto"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => updateStatus(post.id, 'published')}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Approve & Publish
              </button>
              <button
                onClick={() => updateStatus(post.id, 'rejected')}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}