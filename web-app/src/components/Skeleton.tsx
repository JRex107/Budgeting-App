import './Skeleton.css';

interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  className?: string;
}

export function Skeleton({
  variant = 'rectangular',
  width,
  height,
  className = ''
}: SkeletonProps) {
  const style: React.CSSProperties = {
    width,
    height,
  };

  return (
    <div
      className={`skeleton skeleton-${variant} ${className}`}
      style={style}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <Skeleton variant="text" width="60%" height="20px" />
      <Skeleton variant="text" width="40%" height="16px" />
      <Skeleton variant="rectangular" width="100%" height="100px" />
    </div>
  );
}

export function SkeletonStat() {
  return (
    <div className="skeleton-stat">
      <Skeleton variant="circular" width="48px" height="48px" />
      <div style={{ flex: 1 }}>
        <Skeleton variant="text" width="80px" height="14px" />
        <Skeleton variant="text" width="120px" height="24px" />
      </div>
    </div>
  );
}

export function SkeletonBudget() {
  return (
    <div className="skeleton-budget">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <Skeleton variant="text" width="100px" height="16px" />
        <Skeleton variant="text" width="50px" height="16px" />
      </div>
      <Skeleton variant="rectangular" width="100%" height="8px" />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
        <Skeleton variant="text" width="60px" height="14px" />
        <Skeleton variant="text" width="80px" height="14px" />
      </div>
    </div>
  );
}

export function SkeletonTransaction() {
  return (
    <div className="skeleton-transaction">
      <Skeleton variant="circular" width="40px" height="40px" />
      <div style={{ flex: 1 }}>
        <Skeleton variant="text" width="150px" height="16px" />
        <Skeleton variant="text" width="100px" height="14px" />
      </div>
      <div style={{ textAlign: 'right' }}>
        <Skeleton variant="text" width="80px" height="16px" />
        <Skeleton variant="text" width="60px" height="14px" />
      </div>
    </div>
  );
}
