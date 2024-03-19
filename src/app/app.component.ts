import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { COMMA, SPACE } from '@angular/cdk/keycodes';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Country } from './interfaces';

const MATERIALIMPORTS = [
  MatCardModule,
  MatButtonModule,
  MatDialogModule,
  MatInputModule,
  MatFormFieldModule,
  MatIconModule,
  MatChipsModule,
];

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HttpClientModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ...MATERIALIMPORTS,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  countries: Country[] = [];
  selectCountry!: Partial<Country>;
  languages!: {};
  form = new FormGroup({
    name: new FormControl('', Validators.required),
    capital: new FormControl('', Validators.required),
    area: new FormControl(0, Validators.required),
    flag: new FormControl(''),
    language: new FormControl(''),
  });

  @ViewChild('countryForm') countryForm!: TemplateRef<any>;

  readonly separatorKeysCodes = [COMMA, SPACE] as const;
  readonly URL =
    'https://restcountries.com/v3.1/all?fields=cca3,name,capital,area,languages,flags';
  readonly URLFLAG =
    'https://opensource.google/static/images/projects/os-projects-angular.svg';

  constructor(private http: HttpClient, public dialog: MatDialog) {}

  ngOnInit(): void {
    if (localStorage.getItem('countries')) {
      this.countries = JSON.parse(
        localStorage.getItem('countries') as string
      ) as Country[];
    } else {
      this.getData().subscribe((res) => {
        this.countries = res;
        localStorage.setItem('countries', JSON.stringify(this.countries));
      });
    }
  }

  getData() {
    return this.http.get<Country[]>(this.URL);
  }

  edit(country: Country) {
    this.selectCountry = country;
    this.form.patchValue({
      name: country.name.common,
      capital: country.capital[0],
      area: country.area,
      flag: country.flags.png,
      language: '',
    });
    this.languages = country.languages;
    this.form.get('flag')?.disable();
    this.openDialog();
  }

  add() {
    this.form.reset();
    this.form.enable();
    this.languages = {};
    this.selectCountry = {};
    this.openDialog();
  }

  save() {
    const values = this.form.getRawValue();
    if (values.language) {
      this.languages = {
        ...this.languages,
        [values.language]: values.language,
      };
    }
    if (this.selectCountry.cca3) {
      const country = this.countries.find(
        (country) => country.cca3 === this.selectCountry.cca3
      ) as Country;
      country.name.common = values.name as string;
      country.capital = [values.capital as string];
      country.area = values.area as number;
      country.languages = this.languages;
    } else {
      const newCountry: Country = {
        name: {
          common: values.name as string,
          official: 'Republic of ' + values.name,
        },
        capital: [values.capital as string],
        area: values.area as number,
        cca3: `${values.name}${Math.round(Math.random() * 100)}`,
        flags: { png: values.flag ?? this.URLFLAG },
        languages: this.languages,
      };
      this.countries.unshift(newCountry);
    }
    this.dialog.closeAll();
    this.form.reset();
  }

  openDialog() {
    this.dialog.open(this.countryForm);
  }

  delete(code: string) {
    this.countries = this.countries.filter((country) => country.cca3 !== code);
  }

  addChip(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      this.languages = { ...this.languages, [value]: value };
    }
    event.chipInput!.clear();
  }

  removeChip(lang: any): void {
    delete (this.languages as any)[lang.key];
  }
}
