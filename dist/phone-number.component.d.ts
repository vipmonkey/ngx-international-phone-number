import { ElementRef, OnInit, EventEmitter } from '@angular/core';
import { ControlValueAccessor, FormControl, Validator, ValidationErrors } from '@angular/forms';
import { Country } from './country.model';
import { CountryService } from './country.service';
export declare class PhoneNumberComponent implements OnInit, ControlValueAccessor, Validator {
    private countryService;
    placeholder: string;
    errorTextRequired: string;
    maxlength: number;
    defaultCountry: string;
    allowDropdown: boolean;
    type: string;
    formControl: FormControl;
    allowedCountries: Country[];
    onCountryCodeChanged: EventEmitter<any>;
    phoneComponent: ElementRef;
    onTouch: Function;
    onModelChange: Function;
    countries: Country[];
    selectedCountry: Country;
    countryFilter: string;
    showDropdown: boolean;
    phoneNumber: string;
    value: string;
    phoneNumberInput: ElementRef;
    /**
     * Util function to check if given text starts with plus sign
     * @param text
     */
    private static startsWithPlus;
    /**
     * Reduced the prefixes
     * @param foundPrefixes
     */
    private static reducePrefixes;
    constructor(countryService: CountryService, phoneComponent: ElementRef);
    ngOnInit(): void;
    /**
     * Sets the selected country code to given country
     * @param event
     * @param countryCode
     */
    updateSelectedCountry(event: Event, countryCode: string): void;
    /**
     * Updates the phone number
     * @param event
     */
    updatePhoneNumber(event: Event): void;
    /**
     * @param prefix
     */
    private findPrefix;
    /**
     * Sort countries by name
     */
    private orderCountriesByName;
    /**
     *
     * @param fn
     */
    registerOnTouched(fn: Function): void;
    /**
     *
     * @param fn
     */
    registerOnChange(fn: Function): void;
    /**
     *
     * @param value
     */
    writeValue(value: string): void;
    /**
     * Validation
     * @param c
     */
    validate(c: FormControl): ValidationErrors | null;
    /**
     * Updates the value and trigger changes
     */
    private updateValue;
    /**
     * Updates the input
     * @param countryCode
     */
    private updatePhoneInput;
    /**
     * Returns the selected country's dialcode
     */
    getSelectedCountryDialCode(): string;
}
