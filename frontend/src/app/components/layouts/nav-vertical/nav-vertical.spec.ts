import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavVertical } from './nav-vertical';

describe('NavVertical', () => {
  let component: NavVertical;
  let fixture: ComponentFixture<NavVertical>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavVertical]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavVertical);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
