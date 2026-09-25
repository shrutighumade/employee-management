import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { provideRouter } from '@angular/router';
import { Location } from '@angular/common';
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
  let location: Location;

  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [PageNotFound],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(PageNotFound);
    component = fixture.componentInstance;
    location = TestBed.inject(Location);
    fixture.detectChanges();
  });

  it('should create the 404 page not found component', () => {
    expect(component).toBeTruthy();
  });

  it('should render 404 title and error badge', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.error-code')?.textContent).toContain('404');
    expect(compiled.querySelector('.error-title')?.textContent).toContain('Page Not Found');
  });

  it('should trigger location back when goBack is called', () => {
    const spy = vi.spyOn(location, 'back');
    (component as any).goBack();
    expect(spy).toHaveBeenCalled();
  });
});
