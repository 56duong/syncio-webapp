import { ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';

@Component({
  selector: 'app-resizable-draggable-component',
  templateUrl: './resizable-draggable.component.html',
  styleUrls: ['./resizable-draggable.component.scss']
})

export class ResizableDraggableComponent {
  /**
   * The parent element to which the object is bound. It will select the parent element by the document.querySelector.
   * @example
   * dragBoundary = '#story'
   * dragBoundary = '.story'
   */
  @Input() dragBoundary!: string; // parent element to which the object is bound

  /**
   * Emit an event when the object is selected.
   */
  @Output() isSelected = new EventEmitter<boolean>();

  /**
   * The x position of the object based on the parent element. 
   */
  x: number = 0;

  /**
   * The y position of the object based on the parent element.
   */
  y: number = 0;

  /**
   * The previous x position of the mouse on window when clicked on the object to drag.
   */
  px: number = 0;

  /**
   * The previous y position of the mouse on window when clicked on the object to drag.
   */
  py: number = 0;

  /**
   * The width of the object.
   */
  width: number = 50;

  /**
   * The height of the object.
   */
  height: number = 50;

  /**
   * The minimum area of the object. 
   * If the area of the object is less than this value, the object will not be resized.
   */
  minArea: number = 2000;

  /**
   * Check if the corner is being dragged. 
   * Triggered when the corner is clicked.
   */
  isDraggingCorner: boolean = false;

  /**
   * Check if the object is being dragged. 
   * Triggered when the object is clicked.
   */
  isDraggingObject: boolean = false;

  /**
   * Check if the dragging wrapper is visible. Used to set the css of the dragging wrapper.
   */
  isDraggingWrapperVisible: boolean = false;

  /**
   * The resizer function to resize the object. 
   * It will be set based on the corner clicked.
   */
  resizer: Function = () => { }; // function to resize the object

  /**
   * The width of the parent element.
   */
  parentWidth: number = 0;

  /**
   * The height of the parent element.
   */
  parentHeight: number = 0;

  constructor(
    private elementRef: ElementRef,
    private cdr: ChangeDetectorRef
  ) { }

  ngAfterViewInit() {
    // Get the parent element width and height
    const parentElement = document.querySelector<HTMLElement>(this.dragBoundary);
    if (!parentElement) return;

    this.parentWidth = parentElement.offsetWidth;
    this.parentHeight = parentElement.offsetHeight;

    // Set the parent element position to relative
    parentElement.style.position = 'relative';

    // Get the width and height of the content inside the object and set the object size to the size of the content
    // After that, set the object size to 100% to make it resizable as the object
    setTimeout(() => {
      // Get the width and height of the first object inside the <ng-content></ng-content>
      let contentElement = this.elementRef.nativeElement.children[0]?.children[0]?.children[0];

      if(!contentElement) return;

      // Set the width and the height to auto to get the actual width and height of the content
      contentElement.style.width = 'auto';
      contentElement.style.height = 'auto';

      // Set the width and height of the object to the width and height of the content  
      this.width = contentElement.offsetWidth;
      this.height = contentElement.offsetHeight;
  
      // If the object is bigger than the parent element, set its size to the size of the parent element
      if (this.width > this.parentWidth) {
        this.width = this.parentWidth;
      }
      if (this.height > this.parentHeight) {
        this.height = this.parentHeight;
      }

      // Set the width and height of the object to 100% to make it resizable
      contentElement.style.width = '100%';
      contentElement.style.height = '100%';
  
      this.cdr.detectChanges();
    }, 10);
  }

  /**
   * Calculate the area of the object.
   * @returns area of the object
   */
  area() {
    return this.width * this.height;
  }

  /**
   * Triggered when the object is pressing.
   * @param event
   */
  onObjectPress(event: MouseEvent) {
    this.isDraggingObject = true;
    this.isDraggingWrapperVisible = true;
    this.px = event.clientX;
    this.py = event.clientY;
    this.isSelected.emit(true);
  }

  /**
   * Triggered when the object is dragging (moving). 
   * Calculate and update the new position of the object.
   * @param event
   */
  onObjectDragging(event: MouseEvent) {
    if (!this.isDraggingObject) {
      return;
    }

    // Calculate the distance the mouse has moved from the previous position to the current position.
    // offsetX = current x position of the mouse - previous x position of the mouse
    // offsetY = current y position of the mouse - previous y position of the mouse
    let offsetX = event.clientX - this.px;
    let offsetY = event.clientY - this.py;
    
    // Calculate the new position of the object
    this.x += offsetX;
    this.y += offsetY;

    // Check if the object is going out of the parent element from the left
    if(this.x < 0) {
      this.x = 0;
    }

    // Check if the object is going out of the parent element from the top
    if(this.y < 0) {
      this.y = 0;
    }

    // Check if the object is going out of the parent element from the right
    if(this.x + this.width > this.parentWidth) {
      this.x = this.parentWidth - this.width;
    }

    // Check if the object is going out of the parent element from the bottom
    if(this.y + this.height > this.parentHeight) {
      this.y = this.parentHeight - this.height;
    }

    // Set the previous x and y position of the mouse to the current x and y position of the mouse
    this.px = event.clientX;
    this.py = event.clientY;
  }

  /**
   * Resize the object from the top left corner. Triggered when the top left corner is clicked.
   * @param offsetX 
   * @param offsetY 
   */
  topLeftResize(offsetX: number, offsetY: number) {
    // calculate the new position of the object
    this.x += offsetX;
    this.y += offsetY;
    this.width -= offsetX;
    this.height -= offsetY;
  }

  /**
   * Resize the object from the top right corner. Triggered when the top right corner is clicked.
   * @param offsetX 
   * @param offsetY 
   */
  topRightResize(offsetX: number, offsetY: number) {
    this.y += offsetY;
    this.width += offsetX;
    this.height -= offsetY;
  }

  /**
   * Resize the object from the bottom left corner. Triggered when the bottom left corner is clicked.
   * @param offsetX 
   * @param offsetY 
   */
  bottomLeftResize(offsetX: number, offsetY: number) {
    this.x += offsetX;
    this.width -= offsetX;
    this.height += offsetY;
  }

  /**
   * Resize the object from the bottom right corner. Triggered when the bottom right corner is clicked.
   * @param offsetX 
   * @param offsetY 
   */
  bottomRightResize(offsetX: number, offsetY: number) {
    this.width += offsetX;
    this.height += offsetY;
  }

  /**
   * Triggered when the corner is clicked. Call the resizer function based on the corner clicked.
   * @param event 
   * @param resizer the callback function to resize the object (topLeftResize, topRightResize, bottomLeftResize, bottomRightResize)
   */
  onCornerClick(event: MouseEvent, resizer: Function) {
    this.isDraggingCorner = true;
    this.px = event.clientX;
    this.py = event.clientY;
    this.resizer = resizer; // set the resizer function based on the corner clicked
    event.preventDefault();
    event.stopPropagation();
  }

  /**
   * When the corner is moving.
   * @param event 
   */
  @HostListener('document:mousemove', ['$event'])
  onCornerMove(event: MouseEvent) {
  
    // Check if the corner is being dragging
    if (!this.isDraggingCorner) {
        return;
    }

    // Calculate the distance the mouse has moved from the previous position to the current position
    let offsetX = event.clientX - this.px;
    let offsetY = event.clientY - this.py;

    // Save the last x, y position and width, height of the object
    let lastX = this.x;
    let lastY = this.y;
    let pWidth = this.width;
    let pHeight = this.height;

    // Call the resizer function based on the corner clicked (set in onCornerClick function)
    this.resizer(offsetX, offsetY);

    // Check if the object is too small or going out of the parent element
    if (this.area() < this.minArea // too small
      || this.x < 0 // outside the left of the parent
      || this.y < 0 // outside the top of the parent
      || this.x + this.width > this.parentWidth // outside the right of the parent
      || this.y + this.height > this.parentHeight // outside the bottom of the parent
    ) {
        // Reset to last position and size
        this.x = lastX;
        this.y = lastY;
        this.width = pWidth;
        this.height = pHeight;
    }

    // Update last mouse position
    this.px = event.clientX;
    this.py = event.clientY;

  }

  /**
   * Triggered when the object is released.
   * @param event 
   */
  @HostListener('document:mouseup', ['$event'])
  onCornerRelease(event: MouseEvent) {
    this.isDraggingObject = false;
    this.isDraggingCorner = false;

  }

  /**
   * Check if the click is outside the object. If so, hide the dragging wrapper.
   * @param event 
   */
  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target) && this.isDraggingWrapperVisible) {
      this.isDraggingWrapperVisible = false;
      this.isSelected.emit(false);
    }
  }
  
}
