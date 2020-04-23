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

    $(() => {
      $('.custom-error').each((index, element) => {
        const $element = $(element);
        $element.show();
      });
    });

    $(() => {
      $('.custom-error').each((index, element) => {
        const $element = $(element);
        const timeout = $element.data('auto-dismiss') || 10000;
        setTimeout(() => {
          $element.hide();
        }, timeout);
      });
    });
  }

  setWarning(warning: any) {
    this.errors = undefined;
    this.message = undefined;
    this.loading = false;
    this.warning = warning;
    $(() => {
      $('.custom-warning').each((index, element) => {
        const $element = $(element);
        $element.show();
      });
    });
    $(() => {
      $('.custom-warning').each((index, element) => {
        const $element = $(element);
        const timeout = $element.data('auto-dismiss') || 7500;
        setTimeout(() => {
          $element.hide();
        }, timeout);
      });
    });
  }

  setMessage(message: any) {
    this.errors = undefined;
    this.message = message;
    this.loading = false;
    this.warning = undefined;
    console.log(this.message);
    $(() => {
      $('.custom-message').each((index, element) => {
        const $element = $(element);
        $element.show();
      });
    });
    $(() => {
      $('.custom-message').each((index, element) => {
        const $element = $(element);
        const timeout = $element.data('auto-dismiss') || 7500;
        setTimeout(() => {
          $element.hide();
        }, timeout);
      });
    });
  }

  clear() {
    this.errors = undefined;
    this.message = undefined;
    this.warning = undefined;
    this.loading = false;
  }
}
