import { Component, type ReactNode, type ErrorInfo } from 'react';
import styles from './ErrorBoundary.module.css';

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.container}>
          <p className={styles.message}>
            {this.props.fallbackMessage || '오류가 발생했습니다'}
          </p>
          <button className={styles.retryBtn} onClick={this.handleRetry} data-testid="error-boundary-retry">
            다시 시도
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
