import { Component, Directive, NgModule } from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Directive({
  providers: [
    {
      multi: true,
      provide: NG_VALUE_ACCESSOR,
      useExisting: CvaDirective,
    },
  ],
  selector: 'custom',
})
class CvaDirective implements ControlValueAccessor {
  public registerOnChange = (fn: never) =>
    (this.customChangeClb = fn);
  public registerOnTouched = (fn: never) =>
    (this.customTouchedClb = fn);
  public setDisabledState = () => undefined;
  public writeValue = () => undefined;

  public customChangeClb() {}
  public customTouchedClb() {}
}

@Component({
  selector: 'my',
  template: ` <custom [formControl]="myControl"></custom> `,
})
class MyComponent {
  public readonly myControl = new FormControl();
}

@NgModule({
  declarations: [MyComponent, CvaDirective],
  exports: [MyComponent],
  imports: [ReactiveFormsModule],
})
class MyModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/3341
describe('ng-mocks-change:3341', () => {
  beforeEach(() => MockBuilder(MyModule));

  it('throws error about the default method', () => {
    MockRender(MyComponent);
    const cvaEl = ngMocks.find('custom');

    expect(() => ngMocks.change(cvaEl, 123)).toThrowError(
      /please ensure it has 'onChange' method/,
    );
  });

  it('throws error with suggestions', () => {
    MockRender(MyComponent);
    const cvaEl = ngMocks.find('custom');

    expect(() => ngMocks.change(cvaEl, 123)).toThrowError(
      /customChangeClb, customTouchedClb/,
    );
  });

  it('throws error about the wrongly provided method', () => {
    MockRender(MyComponent);
    const cvaEl = ngMocks.find('custom');

    expect(() =>
      ngMocks.change(cvaEl, 123, 'triggerChange'),
    ).toThrowError(/please ensure it has 'triggerChange' method/);
  });

  it('triggers change correctly', () => {
    const component = MockRender(MyComponent).point.componentInstance;
    const cvaEl = ngMocks.find('custom');

    expect(component.myControl.value).toEqual(null);
    ngMocks.change(cvaEl, 123, 'customChangeClb');
    expect(component.myControl.value).toEqual(123);
  });
});
