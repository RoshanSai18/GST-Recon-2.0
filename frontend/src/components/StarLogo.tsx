const StarLogo = ({ className = "w-8 h-8" }: { className?: string }) => {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Upward triangle */}
      <polygon
        points="20,4 34,28 6,28"
        fill="currentColor"
        opacity="0.9"
      />
      {/* Downward triangle */}
      <polygon
        points="20,36 6,12 34,12"
        fill="currentColor"
        opacity="0.5"
      />
    </svg>
  );
};

export default StarLogo;
