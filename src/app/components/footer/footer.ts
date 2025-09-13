import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedService } from '../../services/sharedService';
import { TranslatePipe } from "../../services/translate.pipe";
import { FormsModule } from '@angular/forms';
import { I18nService } from '../../services/i18n.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, TranslatePipe, FormsModule],
  templateUrl: './footer.html',
  styleUrl: './footer.scss'
})
export class FooterComponent implements OnInit {
  condition = false;
  currentYear = new Date().getFullYear();
  languages = [
    { code: 'fr', label: 'Français' },
    { code: 'en', label: 'English' },
  ];

  currentLang!: string;

  constructor(private sharedService: SharedService, private i18nService: I18nService) {}

  ngOnInit(): void {
    this.currentLang = localStorage.getItem("selectedLanguage") || "fr";
    console.log("oninit currentLang :: ", this.currentLang);

    console.log("Footer initialized");
    this.sharedService.signal$.subscribe(bool => {
      console.log("Footer received signal: ", bool);
      this.condition = bool;
    });
  }

  changeLanguage(lang: string) {
    this.currentLang = lang;
    console.log("currentLang :: ", this.currentLang);
    this.i18nService.setLanguage(this.currentLang);
  }
}
