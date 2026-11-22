import React from 'react';

export const SkeletonCard = () => {
  return (
    <div className="bg-white rounded-lg border border-stone-200/80 shadow-xs overflow-hidden flex flex-col">
      <div className="w-full h-56 animate-shimmer" />
      <div className="p-5 flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <div className="w-20 h-5 bg-stone-200 rounded-sm animate-shimmer" />
          <div className="w-24 h-6 bg-stone-200 rounded-sm animate-shimmer" />
        </div>
        <div className="w-3/4 h-6 bg-stone-200 rounded-sm animate-shimmer" />
        <div className="w-1/2 h-4 bg-stone-200 rounded-sm animate-shimmer" />
        <div className="grid grid-cols-3 gap-2 pt-2">
          <div className="h-8 bg-stone-100 rounded-md animate-shimmer" />
          <div className="h-8 bg-stone-100 rounded-md animate-shimmer" />
          <div className="h-8 bg-stone-100 rounded-md animate-shimmer" />
        </div>
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
          <div className="w-28 h-4 bg-stone-200 rounded-sm animate-shimmer" />
          <div className="w-24 h-9 bg-stone-200 rounded-md animate-shimmer" />
        </div>
      </div>
    </div>
  );
};

export const SkeletonGrid = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
};
