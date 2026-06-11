const PageHeader = ({ title, subtitle, actions }) => (
  <div className="flex items-start justify-between mb-6">
    <div>
      <h1 className="text-2xl font-semibold text-neutral-900">{title}</h1>
      {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
    </div>
    {actions && <div className="flex gap-2 flex-shrink-0">{actions}</div>}
  </div>
);

export default PageHeader;
