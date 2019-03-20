import {
    Component, ElementRef, forwardRef, HostListener,
    Input, OnInit, Output, EventEmitter, ViewChild
} from '@angular/core';
import {
    ControlValueAccessor, FormControl, Validator,
    ValidationErrors, NG_VALIDATORS, NG_VALUE_ACCESSOR
} from '@angular/forms';
import * as glibphone from 'google-libphonenumber';
import {Country} from './country.model';
import {CountryService} from './country.service';
import {MatSelectModule} from '@angular/material/select';
import {MatInputModule} from '@angular/material/input';

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
    host: {
        '(document:click)': 'hideDropdown($event)'
    },
    providers: [COUNTER_CONTROL_ACCESSOR, VALIDATOR]
})
export class PhoneNumberComponent
    implements OnInit, ControlValueAccessor, Validator {
    // input
    @Input() placeholder = 'Enter phone number'; // default
    @Input() errorTextRequired = 'Phonenumber is reqired';
    @Input() maxlength = 15; // default
    @Input() defaultCountry: string;
    @Input() allowDropdown = true;
    @Input() type = 'text';
    @Input() formControl = new FormControl();
    @Input() allowedCountries: Country[];

    @Output() onCountryCodeChanged: EventEmitter<any> = new EventEmitter();

    // ELEMENT REF
    phoneComponent: ElementRef;

    // CONTROL VALUE ACCESSOR FUNCTIONS
    onTouch: Function;
    onModelChange: Function;

    countries: Country[];
    selectedCountry: Country;
    countryFilter: string;
    showDropdown = false;
    phoneNumber = '';

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
        phoneComponent: ElementRef
    ) {
        this.phoneComponent = phoneComponent;
    }

    ngOnInit(): void {
        if (this.allowedCountries && this.allowedCountries.length) {
            this.countries = this.countryService.getCountriesByISO(this.allowedCountries);
        } else {
            this.countries = this.countryService.getCountries();
        }
        this.orderCountriesByName();
    }

    /**
     * Sets the selected country code to given country
     * @param event
     * @param countryCode
     */
    updateSelectedCountry(event: Event, countryCode: string) {
        event.preventDefault();
        this.updatePhoneInput(countryCode);
        this.onCountryCodeChanged.emit(countryCode);
        this.updateValue();
        // focus on phone number input field
        setTimeout(() => this.phoneNumberInput.nativeElement.focus());
    }

    /**
     * Updates the phone number
     * @param event
     */
    updatePhoneNumber(event: Event) {
        if (PhoneNumberComponent.startsWithPlus(this.phoneNumber)) {
            this.findPrefix(this.phoneNumber.split(PLUS)[1]);
        } else {
            this.selectedCountry = null;
        }

        this.updateValue();
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
     *
     * @param value
     */
    writeValue(value: string) {
        this.value = value || '';
        this.phoneNumber = this.value;

        if (PhoneNumberComponent.startsWithPlus(this.value)) {
            this.findPrefix(this.value.split(PLUS)[1]);
            if (this.selectedCountry) {
                this.updatePhoneInput(this.selectedCountry.countryCode);
            }
        }

        if (this.defaultCountry) {
            this.updatePhoneInput(this.defaultCountry);
        }
    }

    /**
     * Validation
     * @param c
     */
    validate(c: FormControl): ValidationErrors | null {
        let value = c.value;
        // let selectedDialCode = this.getSelectedCountryDialCode();
        let validationError: ValidationErrors = {
            phoneEmptyError: {
                valid: false
            }
        };

        if (c.hasError('reqired')) {
            // if (value && selectedDialCode)
            //     value = value.replace(/\s/g, '').replace(selectedDialCode, '');

            // if (!value) return validationError;
            return validationError;
        }

        if (value) {
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
        this.value = this.phoneNumber.replace(/ /g, '');
        this.onModelChange(this.value);
        this.onTouch();
    }

    /**
     * Updates the input
     * @param countryCode
     */
    private updatePhoneInput(countryCode: string) {
        let newInputValue: string = PhoneNumberComponent.startsWithPlus(
            this.phoneNumber
        )
            ? `${this.phoneNumber
                .split(PLUS)[1]
                .substr(
                    this.selectedCountry.dialCode.length,
                    this.phoneNumber.length
                )}`
            : this.phoneNumber;

        this.selectedCountry = this.countries.find(
            (country: Country) => country.countryCode === countryCode
        );
        if (this.selectedCountry) {
            this.phoneNumber = `${PLUS}${
                this.selectedCountry.dialCode
                } ${newInputValue.replace(/ /g, '')}`;
        } else {
            this.phoneNumber = `${newInputValue.replace(/ /g, '')}`;
        }
    }

    /**
     * Returns the selected country's dialcode
     */
    public getSelectedCountryDialCode(): string {
        if (this.selectedCountry) {
            return PLUS + this.selectedCountry.dialCode;
        }
        ;
        return null;
    }
}
