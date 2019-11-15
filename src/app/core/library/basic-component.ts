export abstract class BasicComponent {
  errors: any;
  message: string;
  loading = false;
  warning: string;

  setError(errors: any) {
    this.errors = errors;
    this.message = undefined;
    this.loading = false;
    this.warning = undefined;
  }
  setWarning(warning: any) {
    this.errors = undefined;
    this.message = undefined;
    this.loading = false;
    this.warning = warning;
  }

  setMessage(message: any) {
    this.errors = undefined;
    this.message = message;
    this.loading = false;
    this.warning = undefined;
  }

  clear() {
    this.errors = undefined;
    this.message = undefined;
    this.warning = undefined;
    this.loading = false;
  }
}
