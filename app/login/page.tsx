import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, signOutCurrentUser } from "@/lib/auth";

type LoginPageProps = {
  searchParams?: Promise<{
    error?: string;
    next?: string;
  }>;
};

function safeNextPath(next: string | undefined) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return "/admin";
  }

  return next;
}

async function login(formData: FormData) {
  "use server";

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNextPath(String(formData.get("next") ?? ""));

  if (!email || !password) {
    redirect(`/login?error=${encodeURIComponent("请输入邮箱和密码")}&next=${next}`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(
      `/login?error=${encodeURIComponent("登录失败，请检查邮箱或密码")}&next=${next}`,
    );
  }

  redirect(next);
}

async function logout() {
  "use server";

  await signOutCurrentUser();
  redirect("/login");
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const user = await getCurrentUser();
  const next = safeNextPath(params?.next);

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white/90 p-6 shadow-sm">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
            DailyReview
          </p>
          <h1 className="mt-3 text-2xl font-bold text-slate-950">登录</h1>
        </div>

        {params?.error ? (
          <p className="mt-5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {params.error}
          </p>
        ) : null}

        {user ? (
          <div className="mt-6 space-y-4">
            <p className="text-sm leading-6 text-slate-700">
              当前已登录：{user.email}
            </p>
            <div className="flex gap-3">
              <a
                className="inline-flex h-10 items-center justify-center rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white"
                href={next}
              >
                进入管理端
              </a>
              <form action={logout}>
                <button
                  className="h-10 rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-700"
                  type="submit"
                >
                  退出
                </button>
              </form>
            </div>
          </div>
        ) : (
          <form action={login} className="mt-6 space-y-4">
            <input name="next" type="hidden" value={next} />
            <label className="block text-sm font-medium text-slate-700">
              邮箱
              <input
                className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-base text-slate-950 outline-none focus:border-emerald-700"
                name="email"
                required
                type="email"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              密码
              <input
                className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-base text-slate-950 outline-none focus:border-emerald-700"
                name="password"
                required
                type="password"
              />
            </label>
            <button
              className="h-11 w-full rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white"
              type="submit"
            >
              登录
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
