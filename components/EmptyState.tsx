// ============================================================
// EmptyState —— 空状态组件
// 功能：当没有公开复盘可展示时，给用户一个友好的空状态提示
//       支持自定义图标、标题、描述和可选的操作链接
//
// 使用方式：
//   <EmptyState />                                          // 默认空状态
//   <EmptyState title="还没有公开复盘" description="去管理端写一篇吧" />
//   <EmptyState icon="📭" title="无数据" description="稍后再来看看" />
//
// 说明：这是纯展示组件（没有交互），所以不需要 "use client"。
// ============================================================

type EmptyStateProps = {
  // 图标/表情符号，默认用一个和"复盘"相关的日历图标
  icon?: string;
  // 主标题，默认"还没有公开复盘"
  title?: string;
  // 描述文字，给用户更多说明
  description?: string;
};

export default function EmptyState({
  icon = "🗒️",
  title = "还没有公开复盘",
  description = "目前还没有任何公开的复盘记录，稍后再来看看吧。",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white/60 px-6 py-16 text-center">
      {/* 图标 */}
      <div className="text-5xl" aria-hidden>
        {icon}
      </div>

      {/* 主标题 */}
      <h3 className="mt-4 text-lg font-semibold text-slate-950">
        {title}
      </h3>

      {/* 描述 */}
      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}
