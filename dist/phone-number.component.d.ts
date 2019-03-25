import { ElementRef, OnInit, EventEmitter } from '@angular/core';
import { ControlValueAccessor, FormControl, Validator, ValidationErrors } from '@angular/forms';
import { Country } from './country.model';
import { CountryService } from './country.service';
import { HttpClient } from '@angular/common/http';
export declare class PhoneNumberComponent implements OnInit, ControlValueAccessor, Validator {
    private countryService;
    private httpClient;
    placeholder: string;
    errorTextRequired: string;
    errorTextEmpty: string;
    defaultCountry: string;
    type: string;
    formControl: FormControl;
    formControlCountry: FormControl;
    allowedCountries: Country[];
    geoLookupAddr: string;
    geoLookupField: string;
    onCountryCodeChanged: EventEmitter<any>;
    phoneComponent: ElementRef;
    onTouch: Function;
    onModelChange: Function;
    countries: Country[];
    selectedCountry: Country;
    countryFilter: string;
    preventCircular: boolean;
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
    constructor(countryService: CountryService, phoneComponent: ElementRef, httpClient: HttpClient);
    writeValue(obj: any): void;
    private geoLookup;
    ngOnInit(): void;
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
