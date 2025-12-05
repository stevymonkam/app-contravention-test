import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListacontratiComponent } from './listacontrati.component';

describe('ListacontratiComponent', () => {
  let component: ListacontratiComponent;
  let fixture: ComponentFixture<ListacontratiComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ListacontratiComponent]
    });
    fixture = TestBed.createComponent(ListacontratiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
