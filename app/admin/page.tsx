// ============================================================
// app/admin/page.tsx —— 管理端页面
// 访问地址：http://localhost:3000/admin
//
// 说明：
//   这个页面引用了 ReviewEditor 组件。
//   目前 ReviewEditor 里面用的是 mock 保存函数。
//   等到第7步时，成员T会提供真实的 createReview 函数，
//   到时候只需要修改 ReviewEditor 里的 mockSaveReview 即可。
// ============================================================

// ⚠️ 注意：这个页面需要登录才能访问。
//    成员T会在 middleware.ts 中配置管理员页面保护。
//    如果没登录访问 /admin，会被重定向到登录页。

import ReviewEditor from "@/components/ReviewEditor";

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <ReviewEditor />
    </main>
  );
}
