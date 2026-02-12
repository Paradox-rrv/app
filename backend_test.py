import requests
import sys
import json
from datetime import datetime

class PhoneXchangeAPITester:
    def __init__(self, base_url="https://phoneshop-patna.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_result(self, test_name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {test_name} - PASSED")
        else:
            print(f"❌ {test_name} - FAILED: {details}")
        
        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, params=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)

            print(f"   Status: {response.status_code}")
            
            success = response.status_code == expected_status
            if success:
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
                    self.log_result(name, True)
                    return True, response_data
                except:
                    print(f"   Response: {response.text[:200]}...")
                    self.log_result(name, True)
                    return True, {}
            else:
                error_msg = f"Expected {expected_status}, got {response.status_code}"
                try:
                    error_data = response.json()
                    error_msg += f" - {error_data}"
                except:
                    error_msg += f" - {response.text[:100]}"
                
                self.log_result(name, False, error_msg)
                return False, {}

        except Exception as e:
            error_msg = f"Request failed: {str(e)}"
            print(f"   Error: {error_msg}")
            self.log_result(name, False, error_msg)
            return False, {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        return self.run_test("Root API", "GET", "", 200)

    def test_get_brands(self):
        """Test getting all brands"""
        success, data = self.run_test("Get Brands", "GET", "brands", 200)
        if success and isinstance(data, list) and len(data) > 0:
            print(f"   Found {len(data)} brands")
            return True, data
        elif success:
            self.log_result("Get Brands - Data Validation", False, "No brands returned")
            return False, []
        return False, []

    def test_get_models(self, brand_id):
        """Test getting models for a brand"""
        success, data = self.run_test(f"Get Models for {brand_id}", "GET", f"models/{brand_id}", 200)
        if success and isinstance(data, list):
            print(f"   Found {len(data)} models for {brand_id}")
            return True, data
        return False, []

    def test_get_questions(self):
        """Test getting all questions"""
        success, data = self.run_test("Get Questions", "GET", "questions", 200)
        if success and isinstance(data, list) and len(data) > 0:
            print(f"   Found {len(data)} questions")
            return True, data
        elif success:
            self.log_result("Get Questions - Data Validation", False, "No questions returned")
            return False, []
        return False, []

    def test_calculate_price(self, model_id, sample_answers):
        """Test price calculation"""
        request_data = {
            "model_id": model_id,
            "answers": sample_answers
        }
        success, data = self.run_test("Calculate Price", "POST", "calculate-price", 200, request_data)
        if success and "final_price" in data:
            print(f"   Calculated price: ₹{data.get('final_price', 0)}")
            print(f"   Base price: ₹{data.get('base_price', 0)}")
            print(f"   Is blocked: {data.get('is_blocked', False)}")
            return True, data
        return False, {}

    def test_calculate_price_blocking(self, model_id):
        """Test price calculation with blocking condition"""
        # Answer "No" to "Does the phone turn ON?" which should block the offer
        blocking_answers = {"q1": False}  # Phone doesn't turn on
        
        request_data = {
            "model_id": model_id,
            "answers": blocking_answers
        }
        success, data = self.run_test("Calculate Price - Blocking Condition", "POST", "calculate-price", 200, request_data)
        if success and data.get("is_blocked") == True:
            print(f"   Correctly blocked with reason: {data.get('block_reason', 'N/A')}")
            return True, data
        elif success:
            self.log_result("Calculate Price - Blocking Logic", False, "Should have been blocked but wasn't")
            return False, {}
        return False, {}

    def test_get_phones_for_sale(self):
        """Test getting phones for sale"""
        success, data = self.run_test("Get Phones for Sale", "GET", "phones-for-sale", 200)
        if success and isinstance(data, list) and len(data) > 0:
            print(f"   Found {len(data)} phones for sale")
            return True, data
        elif success:
            self.log_result("Get Phones for Sale - Data Validation", False, "No phones returned")
            return False, []
        return False, []

    def test_get_phones_with_filter(self, brand_name):
        """Test getting phones with brand filter"""
        params = {"brand": brand_name}
        success, data = self.run_test(f"Get Phones - Filter by {brand_name}", "GET", "phones-for-sale", 200, params=params)
        if success and isinstance(data, list):
            filtered_count = len([p for p in data if p.get("brand") == brand_name])
            print(f"   Found {len(data)} phones, {filtered_count} matching brand filter")
            return True, data
        return False, []

    def test_get_phone_detail(self, phone_id):
        """Test getting specific phone details"""
        success, data = self.run_test(f"Get Phone Detail - {phone_id}", "GET", f"phones-for-sale/{phone_id}", 200)
        if success and "id" in data:
            print(f"   Phone: {data.get('brand', 'N/A')} {data.get('model', 'N/A')}")
            print(f"   Price: ₹{data.get('price', 0)}")
            return True, data
        return False, {}

    def test_submit_lead_sell(self):
        """Test submitting a sell lead"""
        lead_data = {
            "name": "Test User",
            "phone": "9876543210",
            "area": "Boring Road, Patna",
            "preferred_time": "Morning",
            "phone_model": "Galaxy S23",
            "offered_price": 35000,
            "remarks": "Test lead submission",
            "lead_type": "sell"
        }
        success, data = self.run_test("Submit Sell Lead", "POST", "submit-lead", 200, lead_data)
        if success and "id" in data:
            print(f"   Lead ID: {data.get('id', 'N/A')}")
            return True, data
        return False, {}

    def test_submit_lead_buy(self):
        """Test submitting a buy inquiry lead"""
        lead_data = {
            "name": "Test Buyer",
            "phone": "9876543211",
            "area": "Kankarbagh, Patna",
            "preferred_time": "Evening",
            "phone_model": "Galaxy S22 Ultra",
            "remarks": "Interested in buying this phone",
            "lead_type": "buy"
        }
        success, data = self.run_test("Submit Buy Lead", "POST", "submit-lead", 200, lead_data)
        if success and "id" in data:
            print(f"   Lead ID: {data.get('id', 'N/A')}")
            return True, data
        return False, {}

    def run_comprehensive_test(self):
        """Run all tests in sequence"""
        print("🚀 Starting PhoneXchange API Testing...")
        print(f"📍 Base URL: {self.base_url}")
        print("=" * 60)

        # Test 1: Root endpoint
        self.test_root_endpoint()

        # Test 2: Get brands
        brands_success, brands = self.test_get_brands()
        
        # Test 3: Get models (if brands available)
        models = []
        if brands_success and brands:
            first_brand = brands[0]
            models_success, models = self.test_get_models(first_brand["id"])

        # Test 4: Get questions
        questions_success, questions = self.test_get_questions()

        # Test 5: Calculate price (if models and questions available)
        if models and questions:
            first_model = models[0]
            # Create sample answers (mostly positive to get a price)
            sample_answers = {}
            for i, q in enumerate(questions[:10]):  # Test with first 10 questions
                # Answer positively for non-deducting questions, negatively for deducting ones
                if q.get("yes_deducts", False):
                    sample_answers[q["id"]] = False  # Don't deduct
                else:
                    sample_answers[q["id"]] = True   # Positive answer
            
            self.test_calculate_price(first_model["id"], sample_answers)
            
            # Test blocking condition
            self.test_calculate_price_blocking(first_model["id"])

        # Test 6: Get phones for sale
        phones_success, phones = self.test_get_phones_for_sale()

        # Test 7: Filter phones by brand
        if phones_success and phones:
            unique_brands = list(set(p.get("brand", "") for p in phones))
            if unique_brands:
                self.test_get_phones_with_filter(unique_brands[0])

        # Test 8: Get phone details
        if phones_success and phones:
            first_phone = phones[0]
            self.test_get_phone_detail(first_phone["id"])

        # Test 9: Submit leads
        self.test_submit_lead_sell()
        self.test_submit_lead_buy()

        # Print summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%")

        # Print failed tests
        failed_tests = [r for r in self.test_results if not r["success"]]
        if failed_tests:
            print("\n❌ FAILED TESTS:")
            for test in failed_tests:
                print(f"   • {test['test']}: {test['details']}")

        return self.tests_passed == self.tests_run

def main():
    tester = PhoneXchangeAPITester()
    success = tester.run_comprehensive_test()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())