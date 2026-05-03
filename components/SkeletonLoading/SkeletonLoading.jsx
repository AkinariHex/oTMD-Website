'use client';
import clsx from 'clsx';
import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export default function SkeletonLoading({ styles, number }) {
  {
    return number ? (
      [...Array(number)].map((e, index) => (
        <Skeleton
          key={index}
          baseColor="transparent"
          highlightColor="hsl(222, 26%, 13%)"
          inline={true}
          className={clsx(styles.item)}
        />
      ))
    ) : (
      <Skeleton
        baseColor="transparent"
        highlightColor="hsl(222, 26%, 13%)"
        inline={true}
        className={clsx(styles.item)}
      />
    );
  }
}
