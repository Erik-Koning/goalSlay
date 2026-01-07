import React from 'react';
import Image, { StaticImageData } from 'next/image';
import { cn } from '@/src/lib/utils';
import { motion } from 'framer-motion';

interface FeatheredSceneProps {
  /** The main background image */
  backgroundSrc: StaticImageData | string;
  /** The foreground image (e.g., the Knight) */
  foregroundSrc?: StaticImageData | string;
  /** Background color behind the scene (shows through edges) */
  backgroundColor?: string;
  /** * Size of the fade/feather effect. 
   * Can be percentage ('15%') or pixels ('100px').
   */
  featherWidth?: string;
  /** Content to display */
  children?: React.ReactNode;
  /** Class name for the container */
  containerClassName?: string;
  /** Class name for the content wrapper */
  contentClassName?: string;
}

const FeatheredScene: React.FC<FeatheredSceneProps> = ({
  backgroundSrc,
  foregroundSrc,
  backgroundColor = '#FFFDD0', // Default Cream
  featherWidth = '15%',
  containerClassName = '',
  contentClassName = '',
  children
}) => {
  
  // We calculate the gradient string dynamically based on the prop
  const stops = `transparent, black ${featherWidth}, black calc(100% - ${featherWidth}), transparent`;
  
  const maskStyle: React.CSSProperties = {
    maskImage: `
      linear-gradient(to bottom, ${stops}), 
      linear-gradient(to right, ${stops})
    `,
    WebkitMaskImage: `
      linear-gradient(to bottom, ${stops}), 
      linear-gradient(to right, ${stops})
    `,
    maskComposite: 'intersect',
    WebkitMaskComposite: 'source-in',
  };

  return (
    <div 
      className="flex w-full min-h-screen flex-col items-center justify-start overflow-x-hidden transition-colors duration-500"
      style={{ backgroundColor }}
    >
      {/* 
        Main Container 
        - flex-col: Allows reordering content on mobile
        - min-[801px]:relative: Allows absolute positioning of content on desktop
      */}
      <div className={cn("w-full flex flex-col min-[801px]:relative", containerClassName)}>
        
        {/* Scene Image Container */}
        <div className="relative aspect-video w-full overflow-hidden transition-all duration-500">
          <div
            className="transition-all duration-300 relative h-full w-full overflow-hidden rounded-[0.5rem] lg:rounded-[1.9rem] xl:rounded-[4rem]"
            style={maskStyle}
          >
            {/* Background Landscape */}
            <div className="relative h-full w-full">
               <Image 
                 src={backgroundSrc} 
                 alt="Background Scene" 
                 fill 
                 priority 
                 className="object-cover object-bottom" 
                 style={{ objectPosition: 'bottom' }}
               />
            </div>

            {/* Foreground Character (Optional) */}
            {foregroundSrc && (
              <div
                className="absolute z-10 w-[15%]"
                style={{
                  left: "38%",
                  top: "83%", 
                  transform: "translate(-50%, -50%)",
                }}
              >
                <Image 
                  src={foregroundSrc} 
                  alt="Foreground Character" 
                  width={500} 
                  height={500}
                  className="h-auto w-full drop-shadow-[0_20px_20px_rgba(0,0,0,0.5)]" 
                />
              </div>
            )}
          </div>
        </div>

        {/* 
          Content Slot 
          - On > 800px: Absolute on the right (30% width)
          - On <= 800px: Motion div above image (order-first)
        */}
        <motion.div 
          className={cn(
            "z-20 px-4 py-8 transition-all duration-500 max-w-full",
            //if desktop
            "min-[801px]:absolute min-[801px]:right-[5%] min-[801px]:top-1/2 min-[801px]:-translate-y-1/2 min-[801px]:w-[570px] min-[801px]:text-left",
            //mobile
            "max-[800px]:w-full max-[800px]:order-first max-[800px]:text-center",
            contentClassName
          )}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
};

export default FeatheredScene;
