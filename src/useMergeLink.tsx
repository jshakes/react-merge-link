import { useCallback, useEffect, useState } from 'react';
import useScript from 'react-script-hook';
import {
  InitializeProps,
  UseMergeLinkProps,
  UseMergeLinkResponse,
} from './types';

const isLinkTokenDefined = (
  config: UseMergeLinkProps
): config is InitializeProps => config?.linkToken !== undefined;

export const useMergeLink = ({
  shouldSendTokenOnSuccessfulLink = true,
  ...config
}: UseMergeLinkProps): UseMergeLinkResponse => {
  const [loading, error] = useScript({
    src: 'https://cdn.merge.dev/initialize.js',
    checkForExisting: true,
  });
  const [isReady, setIsReady] = useState(false);
  const isServer = typeof window === 'undefined';
  const isReadyForInitialization =
    !isServer &&
    !!window.MergeLink &&
    !loading &&
    !error &&
    isLinkTokenDefined(config);

  const onKeydown = useCallback((e: KeyboardEvent) => {
    console.log(e.key)
    if (
      e.key === 'Escape'
    ) {
      window.MergeLink.closeLink();
    }
  }, []);

  useEffect(() => {
    if (isReadyForInitialization && window.MergeLink) {
      window.MergeLink.initialize({
        ...config,
        shouldSendTokenOnSuccessfulLink,
        onReady: () => setIsReady(true),
        onExit: () => {
          window.removeEventListener('keydown', onKeydown);
          config.onExit?.();
        }
      });
    }
  }, [isReadyForInitialization, config]);

  const open = useCallback(() => {
    if (window.MergeLink) {
      window.MergeLink.openLink(config);
      // Close Link on esc key press
      window.addEventListener('keydown', onKeydown);
    }
  }, [config]);

  return { open, isReady, error };
};
