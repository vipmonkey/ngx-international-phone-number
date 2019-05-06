import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PhoneNumberComponent } from './phone-number.component';
import { OnlyNumberDirective } from './only-number.directive';
import { CountryPipe } from './country.pipe';
import { CountryService } from './country.service';
import {MatSelectModule} from '@angular/material/select';
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatSelectModule,
        MatInputModule,
        MatIconModule
    ],
    declarations: [
        PhoneNumberComponent,
        OnlyNumberDirective,
        CountryPipe
    ],
    exports: [
        PhoneNumberComponent,
        CountryPipe
    ],
    providers: [CountryService]
})
export class InternationalPhoneNumberModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: InternationalPhoneNumberModule,
      providers: [CountryService]
    };
  }
}
