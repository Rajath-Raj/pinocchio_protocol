'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface PinocchioProps extends React.SVGAttributes<SVGElement> {
  noseProgress: number;
}

const Pinocchio = ({ noseProgress, className, ...props }: PinocchioProps) => {
  const maxNoseWidth = 120; // Max width of the nose when fully extended
  const noseLength = noseProgress * maxNoseWidth;

  return (
    <div className="relative w-24 h-24 -mt-4 -mr-8">
      <svg
        viewBox="0 0 200 150"
        className={cn('w-48 h-48 absolute -top-12 -left-20', className)}
        {...props}
      >
        <defs>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="2" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.2" />
            </filter>
        </defs>
        
        {/* Hat */}
        <path d="M 85 45 L 115 45 L 100 20 Z" fill="#FBBF24" stroke="#ca8a04" strokeWidth="2" filter="url(#shadow)" />
        <path d="M 80 45 Q 100 55 120 45" fill="none" stroke="#ca8a04" strokeWidth="2.5" />

        {/* Head */}
        <circle cx="100" cy="80" r="30" fill="#FFEDD5" stroke="#FDBA74" strokeWidth="2" filter="url(#shadow)" />
        
        {/* Eye */}
        <circle cx="112" cy="75" r="4" fill="#000000" />
        <circle cx="113" cy="74" r="1" fill="#FFFFFF" />

        {/* Nose */}
        <g transform="translate(130 85)">
            <rect 
                x="0" 
                y="-2.5" 
                height="5" 
                fill="#FDBA74" 
                stroke="#F97316" 
                strokeWidth="1.5"
                className="transition-all duration-300 ease-out"
                style={{ width: `${noseLength}px` }}
                rx="2.5"
            />
        </g>
        
        {/* Mouth */}
        <path d="M 105 95 Q 110 100 115 95" fill="none" stroke="#9A3412" strokeWidth="1.5" strokeLinecap="round" />
        
        {/* Hair */}
        <path d="M 80 60 C 70 70, 70 90, 80 100" fill="none" stroke="#4B5563" strokeWidth="3" />
        <path d="M 77 65 C 72 73, 72 88, 77 95" fill="none" stroke="#4B5563" strokeWidth="3" />

      </svg>
    </div>
  );
};

export default Pinocchio;
