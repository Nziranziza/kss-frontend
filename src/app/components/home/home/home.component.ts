import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import objectFitImages from 'object-fit-images';
declare var $;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit {

  constructor() { }

  @ViewChild('about') public about: ElementRef;

  @ViewChild('impact') public impact: ElementRef;

  @ViewChild('home') public home: ElementRef;

  @ViewChild('features') public features: ElementRef;

  ngOnInit() {
    $(() => {
      objectFitImages();
    });
  }

  public scrollToAbout(): void {
    this.about.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'start' });
  }

  public scrollToImpact(): void {
    this.impact.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'start' });
  }

  public scrollToHome(): void {
    this.home.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'start' });
  }

  public scrollToFeatures(): void {
    this.features.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'start' });
  }
}
