import { Component, OnInit,AfterViewInit } from '@angular/core';
import { TokenStorageService } from '../../services/token-storage.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ChangePasswordComponent } from '../change-password/change-password.component';
import { take } from "rxjs/operators";


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit,AfterViewInit {
  user:any;
  constructor(private router: Router,private tokenService : TokenStorageService,public dialog: MatDialog ) { }
  
  ngOnInit(): void {
    this.user = this.tokenService.getUser();
  }

  ngAfterViewInit() {
  
  }

  logOut(){
    this.tokenService.signOut();
    this.router.navigateByUrl('');
  }

  /**
   * Function to open change password component
   * 
   */
  changePassword(){
    this.dialog.open(ChangePasswordComponent, {
      width: '400px',
      data: this.user
    });
  }
}
