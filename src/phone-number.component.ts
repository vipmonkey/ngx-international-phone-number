import {
    Component, ElementRef, forwardRef,
    Input, OnInit, Output, EventEmitter, ViewChild
} from '@angular/core';
import {
    ControlValueAccessor, FormControl, Validator, Validators,
    ValidationErrors, NG_VALIDATORS, NG_VALUE_ACCESSOR
} from '@angular/forms';
import * as glibphone from 'google-libphonenumber';
import {Country} from './country.model';
import {CountryService} from './country.service';
import {HttpClient} from '@angular/common/http';

const PLUS = '+';

const COUNTER_CONTROL_ACCESSOR = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => PhoneNumberComponent),
    multi: true
};

const VALIDATOR = {
    provide: NG_VALIDATORS,
    useExisting: forwardRef(() => PhoneNumberComponent),
    multi: true
};

@Component({
    selector: 'international-phone-number',
    templateUrl: './phone-number.component.html',
    styleUrls: ['./phone-number.component.scss', './assets/css/flags.min.css'],
    host: {},
    providers: [COUNTER_CONTROL_ACCESSOR, VALIDATOR],
})
export class PhoneNumberComponent
    implements OnInit, ControlValueAccessor, Validator {
    // input
    @Input() placeholder = 'Enter phone number'; // default
    @Input() errorTextEmpty = 'Phone number is required';
    @Input() defaultCountry: string;
    @Input() type = 'text';
    @Input() formControl = new FormControl('', [Validators.maxLength(20)]);
    @Input() formControlName = new FormControl('', [Validators.maxLength(20)]);
    @Input() formControlCountry = new FormControl('', [Validators.required]);
    @Input() allowedCountries: Country[];
    @Input() geoLookupAddr = '';
    @Input() geoLookupField = '';
    @Input() useMatIcon = true;
    @Input() matIconToUse = 'check';

    @Output() onCountryCodeChanged: EventEmitter<any> = new EventEmitter();

    // ELEMENT REF
    phoneComponent: ElementRef;

    // CONTROL VALUE ACCESSOR FUNCTIONS
    onTouch: Function;
    onModelChange: Function;

    countries: Country[];
    selectedCountry: Country;
    countryFilter: string;
    preventCircular = false;

    value = '';

    @ViewChild('phoneNumberInput') phoneNumberInput: ElementRef;

    /**
     * Util function to check if given text starts with plus sign
     * @param text
     */
    private static startsWithPlus(text: string): boolean {
        return text.startsWith(PLUS);
    }

    /**
     * Reduced the prefixes
     * @param foundPrefixes
     */
    private static reducePrefixes(foundPrefixes: Country[]) {
        const reducedPrefixes = foundPrefixes.reduce((first: Country, second: Country) =>
            first.dialCode.length > second.dialCode.length ? first : second
        );
        return reducedPrefixes;
    }

    constructor(
        private countryService: CountryService,
        phoneComponent: ElementRef,
        private httpClient: HttpClient
    ) {
        this.phoneComponent = phoneComponent;
    }

    writeValue(obj: any): void {
    }

    private geoLookup(): void {
        this.httpClient.get(this.geoLookupAddr).subscribe((res) => {
            if (typeof res[this.geoLookupField] === 'string') {

                let geoCountry = this.countries.find(
                    (
                        country: Country) => country.countryCode === res[this.geoLookupField].toLowerCase()
                );
                if (geoCountry) {
                    this.defaultCountry = geoCountry.countryCode;
                }
            }
        });
    }


    ngOnInit(): void {
        if (this.allowedCountries && this.allowedCountries.length) {
            this.countries = this.countryService.getCountriesByISO(this.allowedCountries);
        } else {
            this.countries = this.countryService.getCountries();
        }
        this.orderCountriesByName();

        if (this.geoLookupAddr.length > 0) {
            this.geoLookup();
        }

        this.formControlCountry.valueChanges.subscribe(
            (countryCode) => {
                if (!this.preventCircular) {
                    this.updatePhoneInput(countryCode);
                    setTimeout(() => this.phoneNumberInput.nativeElement.focus());
                }
            }
        );
    }


    /**
     * @param prefix
     */
    private findPrefix(prefix: string) {
        let foundPrefixes: Country[] = this.countries.filter((country: Country) =>
            prefix.startsWith(country.dialCode)
        );
        if (foundPrefixes && foundPrefixes.length) {
            this.selectedCountry = PhoneNumberComponent.reducePrefixes(foundPrefixes);
            this.formControlCountry.setValue(this.selectedCountry.countryCode);
        } else {
            this.selectedCountry = null;
        }
    }

    /**
     * Sort countries by name
     */
    private orderCountriesByName() {
        this.countries = this.countries.sort(function (a, b) {
            return a['name'] > b['name'] ? 1 : b['name'] > a['name'] ? -1 : 0;
        });
    }

    /**
     *
     * @param fn
     */
    registerOnTouched(fn: Function) {
        this.onTouch = fn;
    }

    /**
     *
     * @param fn
     */
    registerOnChange(fn: Function) {
        this.onModelChange = fn;
    }


    /**
     * Validation
     * @param c
     */
    validate(c: FormControl): ValidationErrors | null {
        let value = c.value;

        let validationError: ValidationErrors = {
            phoneEmptyError: {
                valid: false
            }
        };

        if (c.hasError('reqired')) {
            return validationError;
        }

        if (value) {

            if (this.defaultCountry && !this.selectedCountry && value[0] !== PLUS) {
                this.updatePhoneInput(this.defaultCountry);
            } else {
                if (PhoneNumberComponent.startsWithPlus(value)) {
                    this.preventCircular = true;
                    this.findPrefix(value.split(PLUS)[1]);
                    this.preventCircular = false;
                }

                if (this.selectedCountry && value[0] !== PLUS) {
                    this.updatePhoneInput(this.selectedCountry.countryCode);
                }
            }

            // validating number using the google's lib phone
            const phoneUtil = glibphone.PhoneNumberUtil.getInstance();
            try {
                let phoneNumber = phoneUtil.parse(value);
                let isValidNumber = phoneUtil.isValidNumber(phoneNumber);
                return isValidNumber ? null : validationError;
            } catch (ex) {
                return validationError;
            }
        }
        return null;
    }

    /**
     * Updates the value and trigger changes
     */
    private updateValue() {
        this.value = this.formControl.value.replace(/ /g, '');
        this.onModelChange(this.value);
        this.onTouch();
    }

    /**
     * Updates the input
     * @param countryCode
     */
    private updatePhoneInput(countryCode: string) {
        let newInputValue: string = PhoneNumberComponent.startsWithPlus(
            this.formControl.value
        )
            ? `${this.formControl.value
                .split(PLUS)[1]
                .substr(
                    this.selectedCountry.dialCode.length,
                    this.formControl.value.length
                )}`
            : this.formControl.value;

        this.selectedCountry = this.countries.find(
            (country: Country) => country.countryCode === countryCode
        );
        if (this.selectedCountry) {
            this.formControl.setValue(`${PLUS}${
                this.selectedCountry.dialCode
                } ${newInputValue.replace(/ /g, '')}`);
            this.updateValue();
        } else {
            this.formControl.setValue(`${newInputValue.replace(/ /g, '')}`);
            this.updateValue();
        }
    }

    /**
     * Returns the selected country's dialcode
     */
    public getSelectedCountryDialCode(): string {
        if (this.selectedCountry) {
            return PLUS + this.selectedCountry.dialCode;
        }
        return null;
    }
}
