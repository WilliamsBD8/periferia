import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavHorizontal } from './nav-horizontal';

describe('NavHorizontal', () => {
  let component: NavHorizontal;
  let fixture: ComponentFixture<NavHorizontal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavHorizontal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavHorizontal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
