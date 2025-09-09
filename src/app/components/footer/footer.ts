import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedService } from '../../services/sharedService';
import { TranslatePipe } from "../../services/translate.pipe";

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './footer.html',
  styleUrl: './footer.scss'
})
export class FooterComponent implements OnInit {
  condition = false;
  currentYear = new Date().getFullYear();

  constructor(private sharedService: SharedService) {}

  ngOnInit(): void {
    console.log("Footer initialized");
    this.sharedService.signal$.subscribe(bool => {
      console.log("Footer received signal: ", bool);
      this.condition = bool;
    });
  }
}
