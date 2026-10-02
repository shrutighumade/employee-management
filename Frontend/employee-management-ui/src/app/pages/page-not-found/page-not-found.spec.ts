import { Location } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PageNotFound } from './page-not-found';

describe('PageNotFound Component', () => {
  let component: PageNotFound;
  let fixture: ComponentFixture<PageNotFound>;
  let location: Location;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageNotFound],
      providers: [provideRouter([])],
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
