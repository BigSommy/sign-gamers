import React from 'react';

export function withAOS<T extends object>(
  WrappedComponent: React.ComponentType<T>,
  options?: { animation?: string; duration?: number; delay?: number }
) {
  return function AOSWrapper(props: T & { aosIndex?: number }) {
    const { aosIndex, ...rest } = props as any;
    const animation = options?.animation || 'fade-up';
    const duration = options?.duration || 800;
    const delay = options?.delay || (aosIndex ? aosIndex * 100 : 0);
    return (
      <div
        data-aos={animation}
        data-aos-duration={duration}
        data-aos-delay={delay}
      >
        <WrappedComponent {...(rest as T)} />
      </div>
    );
  };
}
