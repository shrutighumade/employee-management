import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';

import { Navbar } from './navbar';

describe('Navbar Component', () => {
  let component: Navbar;
  let fixture: ComponentFixture<Navbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Navbar],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Navbar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the navbar component', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle mobile menu signal state', () => {
    expect((component as any).isMobileMenuOpen()).toBe(false);

    (component as any).toggleMobileMenu();

    expect((component as any).isMobileMenuOpen()).toBe(true);

    (component as any).toggleMobileMenu();

    expect((component as any).isMobileMenuOpen()).toBe(false);
  });
});
