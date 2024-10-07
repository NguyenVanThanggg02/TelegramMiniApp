import { SDKProvider, useLaunchParams, useInitData } from '@telegram-apps/sdk-react';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { type FC, useEffect, useMemo } from 'react';

import { App } from '@/components/App.tsx';
import { ErrorBoundary } from '@/components/ErrorBoundary.tsx';

const ErrorBoundaryError: FC<{ error: unknown }> = ({ error }) => (
  <div>
    <p>An unhandled error occurred:</p>
    <blockquote>
      <code>
        {error instanceof Error
          ? error.message
          : typeof error === 'string'
            ? error
            : JSON.stringify(error)}
      </code>
    </blockquote>
  </div>
);

const Inner: FC = () => {
  const debug = useLaunchParams().startParam === 'debug';
  const manifestUrl = useMemo(() => {
    return new URL('tonconnect-manifest.json', window.location.href).toString();
  }, []);

  // Check if the user is accessing from Telegram Mini App
  const initData = useInitData();

  useEffect(() => {
    if (debug) {
      import('eruda').then((lib) => lib.default.init());
    }

    // Log if inside or outside Telegram Mini App
    if (!initData) {
      console.log('User is accessing outside of Telegram Mini App');
    } else {
      console.log('User is accessing inside Telegram Mini App', initData);
    }
  }, [debug, initData]);

  return (
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      <SDKProvider acceptCustomStyles debug={debug}>
        <App/>
      </SDKProvider>
    </TonConnectUIProvider>
  );
};

export const Root: FC = () => (
  <ErrorBoundary fallback={ErrorBoundaryError}>
    <Inner/>
  </ErrorBoundary>
);
