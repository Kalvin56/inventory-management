import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { NavigationEnd, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { filter, Observable } from 'rxjs';
import { User } from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { selectUser } from 'src/app/store/selectors/auth.selector';

interface NavItem {
  title: string;
  route: string;
  icon: string;
  active: boolean;
}

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent implements OnInit {

  @ViewChild(MatSidenav)
  sidenav!: MatSidenav;
  isMobile= true;
  isCollapsed = true;
  user: User | null = null;

  navList: NavItem[] = [
    { title: 'Products', route: '/products', icon: 'inventory_2', active: false },
  ];

  constructor(
    private observer: BreakpointObserver,
    private router: Router,
    private store: Store,
    private authService: AuthService
  ) {
    this.store.select(selectUser).subscribe(user => {
      this.user = user
    })
  }

  ngOnInit() {
    this.observer.observe(['(max-width: 800px)']).subscribe((screenSize) => {
      if(screenSize.matches){
        this.isMobile = true;
      } else {
        this.isMobile = false;
      }
    });

    // S'abonner aux changements de route
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateActiveRoute();
    });

    // Mettre à jour l'état actif lors du chargement initial
    this.updateActiveRoute();
  }

  toggleMenu() {
    if(this.isMobile){
      this.sidenav.toggle();
      this.isCollapsed = false;
    } else {
      this.sidenav.open();
      this.isCollapsed = !this.isCollapsed;
    }
  }

  updateActiveRoute() {
    const currentRoute = this.router.url;
    this.navList.forEach(item => {
      item.active = currentRoute === item.route;
    });
  }

  logout() {
    this.authService.logout();
  }
}
