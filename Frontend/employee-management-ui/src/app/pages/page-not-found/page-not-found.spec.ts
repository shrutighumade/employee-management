import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { provideRouter } from '@angular/router';
import { PageNotFound } from './page-not-found';

beforeAll(() => {
  try {
    TestBed.initTestEnvironment(
      BrowserDynamicTestingModule,
      platformBrowserDynamicTesting()
    );
  } catch {
    // Environment already initialized
  }
});

describe('PageNotFound Component', () => {
  let component: PageNotFound;
  let fixture: ComponentFixture<PageNotFound>;

  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [PageNotFound],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(PageNotFound);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the 404 page not found component', () => {
    expect(component).toBeTruthy();
  });
});
