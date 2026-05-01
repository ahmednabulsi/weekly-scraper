import subprocess
import sys
import time

def run_script(script_name):
    print(f"\n{'='*50}")
    print(f"RUNNING: {script_name}")
    print(f"{'='*50}\n")
    
    try:
        # Using sys.executable to ensure we use the same python interpreter
        result = subprocess.run([sys.executable, script_name], check=True)
        print(f"\n✓ {script_name} completed successfully.")
        return True
    except subprocess.CalledProcessError as e:
        print(f"\n✗ Error running {script_name}: {e}")
        return False

def main():
    scripts = [
        "scraper.py",
        "evergreen_scraper.py",  # Adding this as it's part of your set
        "bosni_scraper.py",
        "yaseen_scraper.py"
    ]
    
    start_time = time.time()
    results = []

    for script in scripts:
        success = run_script(script)
        results.append((script, success))
        # Optional: Add a small delay between scrapers to avoid rate limiting
        time.sleep(2)

    print(f"\n{'='*50}")
    print("FINAL SUMMARY")
    print(f"{'='*50}")
    
    all_success = True
    for script, success in results:
        status = "✓ SUCCESS" if success else "✗ FAILED"
        print(f"{script:20} : {status}")
        if not success:
            all_success = False
            
    duration = time.time() - start_time
    print(f"\nTotal time: {duration:.2f} seconds")
    
    if all_success:
        print("\nAll scrapers finished successfully! 🎉")
    else:
        print("\nSome scrapers encountered errors.")

if __name__ == "__main__":
    main()
